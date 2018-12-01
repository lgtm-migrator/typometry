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

    def create(self, validated_data):
        bigram_score, created = BigramScore.objects.get_or_create(
            bigram=validated_data.get('bigram'),
            user=validated_data.get('user'),
            date=validated_data.get('date'),
            defaults={
                'count': validated_data.get('count'),
                'average_time': validated_data.get('average_time')
            }
        )
        if not created:
            # A WordScore already exists for this date; update it instead
            old_avg_time = bigram_score.average_time
            old_count = bigram_score.count
            new_avg_time = validated_data.get('average_time')
            new_count = validated_data.get('count')
            time_sum = (old_avg_time * old_count) + (new_avg_time * new_count)
            count = old_count + new_count
            avg_time = int(time_sum / count)
            bigram_score.average_time = avg_time
            bigram_score.count = count
            bigram_score.save()
        return bigram_score


class WordScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = WordScore
        fields = ['word', 'user', 'typos', 'count', 'average_time', 'date']

    def create(self, validated_data):
        word_score, created = WordScore.objects.get_or_create(
            word=validated_data.get('word'),
            user=validated_data.get('user'),
            date=validated_data.get('date'),
            defaults={
                'typos': validated_data.get('typos'),
                'count': validated_data.get('count'),
                'average_time': validated_data.get('average_time')
            }
        )
        if not created:
            # A WordScore already exists for this date; update it instead
            old_avg_time = word_score.average_time
            old_count = word_score.count
            new_avg_time = validated_data.get('average_time')
            new_count = validated_data.get('count')
            time_sum = (old_avg_time * old_count) + (new_avg_time * new_count)
            count = old_count + new_count
            avg_time = int(time_sum / count)
            word_score.average_time = avg_time
            word_score.count = count
            word_score.save()

        return word_score
