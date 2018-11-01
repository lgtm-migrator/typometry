from django.db import models
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
