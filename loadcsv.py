import csv
import os
from words.models import Word, Language, WordEntry

path = "/home/main/typometry-api"
os.chdir(path)


with open('wordlist.csv') as csvfile:
    reader = csv.DictReader(csvfile)

    english, new = Language.objects.get_or_create(name='english')
    if new:
        english.save()
    words = {}

    for row in reader:
        word = dict(text=row['Word'], language=english, frequency=int(row['Frequency']))
        if word['text'] not in words:
            words[word['text']] = word
        else:
            words[word['text']]['frequency'] += int(word['frequency'])

    words = words.values()

    for word in words:
        print(word['text'], word['frequency'])

    words = sorted(words, key=lambda w: w['frequency'], reverse=True)
    raw_words = [word['text'] for word in words]
    for i in range(len(words)):
        words[i].rank = i + 1
    Word.objects.bulk_create(raw_words)
    word_entries = []

    for word in words:
        word_entry = WordEntry(word=word, language=english, frequency=word['frequency'], rank=word['rank'])
        word_entries.append(word_entry)

    WordEntry.objects.bulk_create(word_entries)
