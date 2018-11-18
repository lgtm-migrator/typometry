from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import numpy as np


class Word(models.Model):
    text = models.CharField(max_length=64, unique=True, db_index=True)
    # Metadata about user's typing can be stored here, so that it will be
    # carried over to other languages containing the same words.

    def __str__(self):
        return self.text


class Language(models.Model):
    name = models.CharField(max_length=32, unique=True, db_index=True)
    display_name = models.CharField(max_length=64, unique=True)
    words = models.ManyToManyField(Word, through='WordEntry')

    def __str__(self):
        return self.display_name

    def get_word_entries(self, top_n=None):
        if not top_n:
            return WordEntry.objects.get(language=self)
        return WordEntry.objects.filter(language=self).filter(rank__lte=top_n)

    def get_samples(self, num_samples, top_n=None):
        word_entries = self.get_word_entries(top_n)
        words_freq = list(word_entries.values_list('frequency', flat=True))
        probabilities = words_freq / np.linalg.norm(words_freq, ord=1)
        return list(np.random.choice(word_entries, num_samples, p=probabilities))


class WordEntry(models.Model):
    word = models.ForeignKey(Word, on_delete=models.CASCADE)
    language = models.ForeignKey(Language, on_delete=models.CASCADE)
    frequency = models.PositiveIntegerField(default=0)
    rank = models.PositiveIntegerField(default=0)

    def __str__(self):
        return str(self.language) + ' - ' + str(self.word)

    class Meta:
        unique_together = ('rank', 'language')


class Bigram(models.Model):
    bigram = models.CharField(max_length=2, unique=True, db_index=True)

    def __str__(self):
        return str(self.bigram)


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
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
    average_time = models.PositiveIntegerField()
    date = models.DateField()

    def __str__(self):
        return str(self.word) + ' - ' + str(self.average_time) + 'ms'
