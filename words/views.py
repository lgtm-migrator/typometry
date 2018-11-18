from django.http import JsonResponse
from words.models import Language, Word, Bigram
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
        if not request.user.is_authenticated:
            if 'word_scores' not in request.session or not isinstance(request.session['word_scores'], list):
                request.session['word_scores'] = []
            request.session['word_scores'].extend(request.data['word_scores'])

            if 'bigram_scores' not in request.session or not isinstance(request.session['bigram_scores'], list):
                request.session['bigram_scores'] = []
            request.session['bigram_scores'].extend(request.data['bigram_scores'])
            return Response(request.data['word_scores'], status=status.HTTP_200_OK)
        else:
            # User is logged in, store scores in their profile
            if 'word_scores' not in request.data or 'bigram_scores' not in request.data:
                return Response("Invalid request", status=status.HTTP_400_BAD_REQUEST)
            if not isinstance(request.data['word_scores'], list) or not isinstance(request.data['bigram_scores'], list):
                return Response("Word scores or bigram scores not list")
            for word_score in request.data['word_scores']:
                try:
                    word_score['user'] = request.user
                except KeyError:
                    print('KeyError while parsing word scores, continuing...')
                    continue
            for bigram_score in request.data['bigram_scores']:
                try:
                    bigram_score['user'] = request.user
                except KeyError:
                    print('KeyError while parsing bigram scores, continuing...')
            word_score_serializer = WordScoreSerializer(data=request.data['word_scores'], many=True)
            bigram_score_serializer = BigramScoreSerializer(data=request.data['bigram_scores'], many=True)
            if all([word_score_serializer.is_valid(), bigram_score_serializer.is_valid()]):
                word_score_serializer.save()
                bigram_score_serializer.save()
                return Response(status=status.HTTP_201_CREATED)
            errors = [word_score_serializer.errors, bigram_score_serializer.errors]
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
