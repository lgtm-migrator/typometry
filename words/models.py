from django.db import models


class Word(models.Model):
    text = models.CharField(max_length=64, unique=True, db_index=True)

    def __str__(self):
        return self.text


class WordEntry(models.Model):
    word = models.ForeignKey(Word, on_delete=models.CASCADE)
    language = models.ForeignKey('Language', on_delete=models.CASCADE)
    ranking = models.PositiveIntegerField()
    frequency = models.PositiveIntegerField()

    def __str__(self):
        return self.language.name + ' - ' + self.word.text

    class Meta:
        unique_together = ('language', 'ranking')


class Language(models.Model):
    name = models.CharField(max_length=32)
    words = models.ManyToManyField(Word, through='WordEntry')

    def __str__(self):
        return self.name

    def get_words(self, top_n=None):
        if not top_n:
            return self.words.all()
        return self.words.filter(ranking__lte=top_n)
