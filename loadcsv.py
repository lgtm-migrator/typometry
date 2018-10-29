import csv
import os
from words.models import Word, Language, WordEntry

path = "/home/main/typometry-api"
os.chdir(path)


with open('wordlist.csv') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        word = Word(text=row['Word'])
        lang, created = Language.objects.get_or_create(name="english")
        word.save()
        if created:
            lang.save()
        entry = WordEntry(word=word, language=lang, ranking=row['Rank'], frequency=row['Frequency'])
        entry.save()

