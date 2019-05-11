import datetime

from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import numpy as np
import math


class Bigram(models.Model):
    bigram = models.CharField(max_length=2, unique=True, db_index=True, primary_key=True)

    def __str__(self):
        return str(self.bigram)

    @staticmethod
    def create_all_bigrams():
        existing = set(bigram.bigram for bigram in Bigram.objects.all())
        bigram_set = set()
        all_words = Word.objects.all()
        for word in all_words:
            bigrams = word.split_into_component_bigrams().keys()
            bigram_set.update(bigrams)

        all_bigrams = [Bigram(bigram=bigram) for bigram in bigram_set if bigram not in existing]
        Bigram.objects.bulk_create(all_bigrams)
        print('Created %s bigrams.' % str(len(all_bigrams)))


class Word(models.Model):
    text = models.CharField(max_length=64, unique=True, db_index=True, primary_key=True)
    bigram_weights = models.ManyToManyField(Bigram, through='WordBigramWeight')

    # Metadata about user's typing can be stored here, so that it will be
    # carried over to other languages containing the same words.

    def __str__(self):
        return self.text

    def split_into_component_bigrams(self):
        last_char = ' '
        bigrams = []
        bigram_dict = {}
        for char in self.text:
            bigram = last_char + char
            last_char = char
            bigrams.append(bigram)
        bigrams.append(last_char + ' ')

        for bigram in bigrams:
            if bigram in bigram_dict:
                bigram_dict[bigram] += 1
            else:
                bigram_dict[bigram] = 1

        return bigram_dict

    def calculate_bigram_weights(self):
        bigrams = self.split_into_component_bigrams()
        total_bigrams = sum([count for bigram, count in bigrams.items()])
        for bigram, count in bigrams.items():
            weight = count / total_bigrams
            print('Bigram: "%s"' % bigram)
            bigram_instance, created = Bigram.objects.get_or_create(bigram=bigram)
            print(bigram_instance)
            bigram_weight = WordBigramWeight(word=self, bigram=bigram_instance, weight=weight)
            bigram_weight.save()

    @staticmethod
    def calculate_all_bigram_weights():
        Bigram.create_all_bigrams()
        for word in Word.objects.all():
            word.calculate_bigram_weights()


class WordBigramWeight(models.Model):
    word = models.ForeignKey(Word, on_delete=models.CASCADE)
    bigram = models.ForeignKey(Bigram, on_delete=models.CASCADE)
    weight = models.DecimalField(max_digits=5, decimal_places=5)

    class Meta:
        unique_together = ('word', 'bigram')

    def __str__(self):
        return self.word.text + ' - ("' + self.bigram.bigram + '", ' + str(self.weight) + ')'


class Language(models.Model):
    name = models.CharField(max_length=32, unique=True, db_index=True)
    display_name = models.CharField(max_length=64, unique=True)
    words = models.ManyToManyField(Word, through='WordEntry')
    bigrams = models.ManyToManyField(Bigram, through='BigramEntry')
    total_word_occurrences = models.PositiveIntegerField()

    def __str__(self):
        return self.display_name

    def get_word_entries(self, top_n=None):
        if not top_n:
            return self.wordentry_set.all()
        return WordEntry.objects.filter(language=self, rank__lte=top_n)

    def get_words(self, top_n=None):
        if not top_n:
            return self.words.all()
        return Word.objects.filter(language=self, wordentry__rank__lte=top_n)

    def get_bigram_entries(self, top_n=None):
        if not top_n:
            return self.bigramentry_set.all()
        return BigramEntry.objects.filter(language=self, rank__lte=top_n)

    def get_bigrams(self, top_n=None):
        if not top_n:
            return self.bigrams.all()
        return Bigram.objects.filter(language=self, bigramentry__rank__lte=top_n)

    def get_samples(self, num_samples: int, top_n: int = None):
        word_entries = self.get_word_entries(top_n).order_by('frequency')
        words_freq = list(word_entries.values_list('frequency', flat=True))
        probabilities = words_freq / np.linalg.norm(words_freq, ord=1)
        return list(np.random.choice(word_entries, num_samples, p=probabilities))

    def get_samples_for_bigram(self, bigram, num_samples):
        print('getting samples for bigram: ' + bigram)
        bigram_words = WordBigramWeight.objects.filter(bigram=bigram) \
                           .filter(bigram__language=self) \
                           .filter(weight__gte=0.125) \
                           .order_by('weight') \
                           .reverse()[:20]
        if not bigram_words:
            bigram_words = WordBigramWeight.objects.filter(bigram=bigram) \
                               .filter(bigram__language=self) \
                               .filter(weight__gte=0.025) \
                               .order_by('weight') \
                               .reverse()[:20]
            if not bigram_words:
                return []
        bigram_weights = list(bigram_words.values_list('weight', flat=True))
        bigram_weights = [float(weight) for weight in bigram_weights]
        probabilities = bigram_weights / np.linalg.norm(bigram_weights, ord=1)
        bigram_words = list(np.random.choice(bigram_words, num_samples, p=probabilities))
        return [word.word.text for word in bigram_words]

    def create_bigram_entries(self):
        words = self.get_word_entries()
        language_bigrams = {}
        for word in words:
            word_bigrams = word.word.split_into_component_bigrams()
            for bigram, count in word_bigrams.items():
                word_bigrams[bigram] = count * word.frequency
                if bigram not in language_bigrams:
                    language_bigrams[bigram] = word_bigrams[bigram]
                else:
                    language_bigrams[bigram] += word_bigrams[bigram]

        all_bigram_entries = []
        for bigram, freq in language_bigrams.items():
            bigram_obj = Bigram.objects.get(bigram=bigram)
            bigram_entry = BigramEntry(bigram=bigram_obj,
                                       language=self,
                                       frequency=freq)

            all_bigram_entries.append(bigram_entry)

        all_bigram_entries = sorted(all_bigram_entries,
                                    key=lambda x: x.frequency,
                                    reverse=True)
        rank = 1
        for bigram in all_bigram_entries:
            bigram.rank = rank
            rank += 1

        BigramEntry.objects.bulk_create(all_bigram_entries)

    def calculate_total_word_occurrences(self):
        total = 0
        for word in self.wordentry_set.all():
            total += word.frequency

        self.total_word_occurrences = total
        self.save()


class WordEntry(models.Model):
    word = models.ForeignKey(Word, on_delete=models.CASCADE)
    language = models.ForeignKey(Language, on_delete=models.CASCADE)
    frequency = models.PositiveIntegerField(default=0)
    rank = models.PositiveIntegerField(default=0)

    def __str__(self):
        return str(self.language) + ' - ' + str(self.word)

    class Meta:
        unique_together = ('rank', 'language')


class BigramEntry(models.Model):
    bigram = models.ForeignKey(Bigram, on_delete=models.CASCADE)
    language = models.ForeignKey(Language, on_delete=models.CASCADE)
    frequency = models.PositiveIntegerField(default=0)
    rank = models.PositiveIntegerField(default=0)

    def __str__(self):
        return str(self.language) + ' - ' + str(self.bigram)

    class Meta:
        unique_together = ('rank', 'language')


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    bigram_scores = models.ManyToManyField(Bigram, through='BigramScore')
    word_scores = models.ManyToManyField(Word, through='WordScore')

    def __str__(self):
        return str(self.user) + '\'s profile'

    def get_recent_scores(self, days: int, word_score: bool = True, weight_by_date: bool = True, top_n = None):

        def get_weight(date: datetime.date):
            num_days = (datetime.date.today() - date).days
            if num_days == 0:
                return 1

            if num_days >= 16:
                raise ValueError('Day {} passed to get_weight, would result in zero or negative weight!'
                                 .format(num_days))
            if num_days < 0:
                raise ValueError('Day {} passed to get_weight, score from the future?'.format(date))
            # Weight scores logarithmically; scores from today have weight 1, from yesterday, weight 0.5
            # Two days ago: 0.375
            return (4 - math.log2(num_days)) / 8

        min_date = datetime.date.today() - datetime.timedelta(days=days)
        combined_scores = {}
        if word_score:
            min_time = 10
            max_time = 7500
            if top_n:
                # TODO: Make this language-agnostic
                language = Language.objects.first()
                top_n_words = language.get_words(top_n)
                scores = WordScore.objects.filter(user=self, date__gte=min_date, word__in=top_n_words)\
                                          .order_by('word__wordentry__rank')
            else:
                scores = WordScore.objects.filter(user=self, date__gte=min_date).order_by('word__wordentry__rank')
            for score in scores:
                if score.word.text not in combined_scores:
                    combined_scores[score.word.text] = [score]
                else:
                    combined_scores[score.word.text].append(score)

        else:
            min_time = 1
            max_time = 2500
            if top_n:
                # TODO: Make this language-agnostic
                language = Language.objects.first()
                top_n_bigrams = language.get_bigrams(top_n)
                scores = BigramScore.objects.filter(user=self, date__gte=min_date, bigram__in=top_n_bigrams)\
                                            .order_by('bigram__bigramentry__rank')
            else:
                scores = BigramScore.objects.filter(user=self, date__gte=min_date).order_by('bigram__bigramentry__rank')
            for score in scores:
                if not min_time < score.average_time < max_time:
                    continue
                if score.bigram.bigram not in combined_scores:
                    combined_scores[score.bigram.bigram] = [score]
                else:
                    combined_scores[score.bigram.bigram].append(score)

        for word, score_list in combined_scores.items():
            total_trials = sum([score.count for score in score_list])
            if total_trials == 0:  # All instances of this score were filtered out -- average time out of bounds
                continue
            scores = np.array([score.average_time for score in score_list])
            counts = np.array([score.count for score in score_list])
            if weight_by_date:
                dates = [score.date for score in score_list]
                weights = [get_weight(date) for date in dates]
                weights = np.array(weights / np.linalg.norm(weights, ord=1))
                scores = np.multiply(scores, weights)
            scores *= counts
            score_sum = sum(scores)
            combined_scores[word] = score_sum / total_trials

        return combined_scores


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


class BigramScore(models.Model):
    bigram = models.ForeignKey(Bigram, on_delete=models.CASCADE)
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    count = models.PositiveIntegerField()
    average_time = models.PositiveIntegerField()
    date = models.DateField()

    def __str__(self):
        return str(self.bigram) + ' - ' + str(self.average_time) + 'ms (' + str(self.count) + ' trials)'


class WordScore(models.Model):
    word = models.ForeignKey(Word, on_delete=models.CASCADE)
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    typos = models.PositiveIntegerField()
    count = models.PositiveIntegerField()
    average_time = models.PositiveIntegerField()
    date = models.DateField()

    def __str__(self):
        return str(self.word) + ' - ' + str(self.average_time) + 'ms'
