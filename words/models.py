from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import numpy as np


class Bigram(models.Model):
    bigram = models.CharField(max_length=2, unique=True, db_index=True, primary_key=True)

    def __str__(self):
        return str(self.bigram)

    @staticmethod
    def create_all_bigrams():
        existing = set(bigram.bigram for bigram in Bigram.objects.all())
        bigram_set = set()
        all_bigrams = []
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

    def __str__(self):
        return self.display_name

    def get_word_entries(self, top_n=None):
        if not top_n:
            return WordEntry.objects.filter(language=self)
        return WordEntry.objects.filter(language=self, rank__lte=top_n)

    def get_words(self, top_n=None):
        if not top_n:
            return Word.objects.filter(wordentry__language=self)
        return Word.objects.filter(language=self, wordentry__rank__lte=top_n)

    def get_samples(self, num_samples, top_n=None):
        word_entries = self.get_word_entries(top_n).order_by('frequency')
        words_freq = list(word_entries.values_list('frequency', flat=True))
        probabilities = words_freq / np.linalg.norm(words_freq, ord=1)
        return list(np.random.choice(word_entries, num_samples, p=probabilities))

    def get_samples_for_bigram(self, bigram, num_samples):
        bigram_words = WordBigramWeight.objects.filter(bigram=bigram)\
                                               .filter(word__in=self.words.all())\
                                               .filter(weight__gte=0.125)\
                                               .order_by('weight')\
                                               .reverse()[:50]
        bigram_weights = list(bigram_words.values_list('weight', flat=True))
        bigram_weights = [float(weight) for weight in bigram_weights]
        probabilities = bigram_weights / np.linalg.norm(bigram_weights, ord=1)
        return list(np.random.choice(bigram_words, num_samples, p=probabilities))


class WordEntry(models.Model):
    word = models.ForeignKey(Word, on_delete=models.CASCADE)
    language = models.ForeignKey(Language, on_delete=models.CASCADE)
    frequency = models.PositiveIntegerField(default=0)
    rank = models.PositiveIntegerField(default=0)

    def __str__(self):
        return str(self.language) + ' - ' + str(self.word)

    class Meta:
        unique_together = ('rank', 'language')


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    bigram_scores = models.ManyToManyField(Bigram, through='BigramScore')
    word_scores = models.ManyToManyField(Word, through='WordScore')

    def __str__(self):
        return str(self.user) + '\'s profile'


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
