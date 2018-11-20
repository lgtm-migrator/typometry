from rest_framework import serializers
from words.models import Word, Language, BigramScore, Bigram, WordScore


class WordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Word
        fields = ['text']


class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = ['name']


class BigramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bigram
        fields = ['bigram']


class BigramScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = BigramScore
        fields = ['bigram', 'user', 'count', 'average_time', 'date']


class WordScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = WordScore
        fields = ['word', 'user', 'typos', 'count', 'average_time', 'date']
