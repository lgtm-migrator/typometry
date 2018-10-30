from rest_framework import serializers
from words.models import Word, Language


class WordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Word
        fields = ['text']


class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = ['name']
