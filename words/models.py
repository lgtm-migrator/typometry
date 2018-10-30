from django.db import models


class Language(models.Model):
    name = models.CharField(max_length=32, unique=True, db_index=True)

    def __str__(self):
        return self.name

    def get_words(self, top_n=None):
        if not top_n:
            return self.words.all()
        return self.words.filter(ranking__lte=top_n)


class Word(models.Model):
    text = models.CharField(max_length=64, unique=True, db_index=True)
    frequency = models.PositiveIntegerField()
    rank = models.PositiveIntegerField(unique=True, db_index=True)
    language = models.ForeignKey(Language, on_delete=models.CASCADE, blank=False, related_name='words')

    def __str__(self):
        return self.text
