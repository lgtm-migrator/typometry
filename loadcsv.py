import csv
import os
from words.models import Word, Language

path = "/home/main/typometry-api"
os.chdir(path)


with open('wordlist.csv') as csvfile:
    reader = csv.DictReader(csvfile)

    english, new = Language.objects.get_or_create(name='english')
    if new:
        english.save()
    words = []

    for row in reader:
        word, created = Word.objects.get_or_create(text=row['Word'], language=english)
        if created:
            word.frequency = row['Frequency']
            words.append(word)
        else:
            word.frequency += row['Frequency']

    Word.objects.bulk_create(words)