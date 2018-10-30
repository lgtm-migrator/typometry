from django.db import models
import numpy as np
from sklearn.preprocessing import normalize


class Language(models.Model):
    name = models.CharField(max_length=32, unique=True, db_index=True)

    def __str__(self):
        return self.name

    def get_words(self, top_n=None):
        if not top_n:
            return self.words.all()
        return self.words.filter(rank__lte=top_n)

    def get_samples(self, num_samples, top_n=None):
        words = self.get_words(top_n)
        words_freq = list(words.values_list('frequency', flat=True))
        probabilities = normalize(words_freq[:, np.newaxis], axis=0, norm='l1').ravel()
        return np.random.choice(words, num_samples, p=probabilities)


class Word(models.Model):
    text = models.CharField(max_length=64, unique=True, db_index=True)
    frequency = models.PositiveIntegerField(default=0)
    rank = models.PositiveIntegerField(unique=True, db_index=True)
    language = models.ForeignKey(Language, on_delete=models.CASCADE, blank=False, related_name='words')

    def __str__(self):
        return self.text
