import csv
import os
from words.models import Word, Language, WordEntry

path = "/home/main/typometry-api"
os.chdir(path)


with open('wordlist.csv') as csvfile:
    reader = csv.DictReader(csvfile)
    print("Starting...")

    english, new = Language.objects.get_or_create(name='en_us', display_name='US English')
    if new:
        print("Saving new language...")
        english.name = 'en_us'
        english.display_name = 'US English'
        english.save()
    words = {}

    for row in reader:
        word = dict(text=row['Word'], language=english, frequency=int(row['Frequency']))
        if word['text'] not in words:
            words[word['text']] = word
        else:
            words[word['text']]['frequency'] += int(word['frequency'])

    words = words.values()
    words = sorted(words, key=lambda w: w['frequency'], reverse=True)
    existing_words_objects = {word.text: word for word in Word.objects.all()}
    existing_words_text = [word.text for word in existing_words_objects.values()]
    for word in words:
        if word['text'] not in existing_words_text:
            word['word'] = Word(text=word['text'])
            word['word'].save()
        else:
            word['word'] = existing_words_objects[word['text']]

    raw_words = [word['word'] for word in words if word['text'] not in existing_words_text]
    for i in range(len(words)):
        words[i]['rank'] = i + 1
    for word in words:
        print(word['rank'], word['text'], word['frequency'])

    word_entries = []

    for word in words:
        word_entry = WordEntry(word=word['word'], language=english, frequency=word['frequency'], rank=word['rank'])
        word_entries.append(word_entry)

    if new:
        WordEntry.objects.bulk_create(word_entries)
    else:
        print("Updating word entries not yet implemented!")
        print("Language not modified!")

    Word.calculate_all_bigram_weights()
