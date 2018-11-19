from django.contrib import admin
from .models import Word, Language, WordEntry, Profile, Bigram, BigramScore, WordScore, WordBigramWeight

admin.site.register(Word)
admin.site.register(Language)
admin.site.register(WordEntry)
admin.site.register(Profile)
admin.site.register(Bigram)
admin.site.register(BigramScore)
admin.site.register(WordScore)
admin.site.register(WordBigramWeight)

