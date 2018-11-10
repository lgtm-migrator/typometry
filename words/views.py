from django.http import JsonResponse
from words.models import Language
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from words.serializers import WordScoreSerializer, BigramScoreSerializer


def word_list(request):
    """
    Returns a JSON response containing a list of 100 random words of English, sampled from a distribution representing
    their frequency of use.
    """
    if request.method == 'GET':
        # TODO: Make this language-agnostic
        # modify session, test
        english = Language.objects.first()
        words = english.get_samples(100, 5000)
        words = [word.word.text for word in words]
        return JsonResponse(words, safe=False)


class RecordScores(APIView):
    """
    Record word and bigram scores in the session
    """
    def post(self, request):
        request.data['word_scores']['user'] = request.user
        request.data['bigram_scores']['user'] = request.user
        word_score_serializer = WordScoreSerializer(data=request.data['word_scores'])
        bigram_score_serializer = BigramScoreSerializer(data=request.data['bigram_scores'])
        if word_score_serializer.is_valid() and bigram_score_serializer.is_valid():
            word_score_serializer.save()
            bigram_score_serializer.save()
            return Response(status=status.HTTP_201_CREATED)
        errors = [word_score_serializer.errors, bigram_score_serializer.errors]
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)
