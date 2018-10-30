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
        word = Word(text=row['Word'], language=english)
        if word not in words:
            word.frequency = row['Frequency']
            words.append(word)
        else:
            word.frequency += row['Frequency']

    words = sorted(words, key=lambda w: w.frequency, reverse=True)
    print(words)
    for i in range(len(words)):
        words[i].rank = i + 1
    Word.objects.bulk_create(words)

