import csv
import os
from words.models import Word, Language
from collections import defaultdict

path = "/home/main/typometry-api"
os.chdir(path)


with open('wordlist.csv') as csvfile:
    reader = csv.DictReader(csvfile)

    english, new = Language.objects.get_or_create(name='english')
    if new:
        english.save()
    words = {}

    for row in reader:
        word = Word(text=row['Word'], language=english, frequency=row['Frequency'])
        if word.text not in words:
            words[word.text] = word
        else:
            words[word.text].frequency += word.frequency

    words = words.items()
    words = sorted(words, key=lambda w: w.frequency, reverse=True)
    for i in range(len(words)):
        words[i].rank = i + 1
    Word.objects.bulk_create(words)

