from django.contrib import admin
from .models import Word, Language, WordEntry

admin.site.register(Word)
admin.site.register(Language)
admin.site.register(WordEntry)
