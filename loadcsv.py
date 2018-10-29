import csv
import os
from words.models import Word, Language, WordEntry

path = "/home/main/typometry-api"
os.chdir(path)


with open('wordlist.csv') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        word = Word(text=row['Word'])
        lang = Language(name="english")
        word.save()
        lang.save()
        entry = WordEntry(word=word, language=lang, ranking=row['Rank'], frequency=row['Frequency'])
        entry.save()

