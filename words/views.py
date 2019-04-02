from django.http import JsonResponse
from words.models import Language, Word, Bigram
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from words.serializers import WordScoreSerializer, BigramScoreSerializer
from words.models import WordScore, BigramScore
from django.contrib.auth.models import AnonymousUser
import datetime


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


def smart_exercise(request):
    """
    Returns a JSON response with a personalized list of words. If we do not have sufficient data on the user's typing
    in the selected language, returns a list of the most popular words in that language to gather data. Otherwise,
    attempts to identify weaknesses in the user's typing and delivers a personalized exercise to rectify.
    """
    if not request.method == 'GET':
        error = {"You've come to the wrong place."}
        return Response(error, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    # TODO: Make this language-agnostic
    language = Language.objects.first()

    # Is user logged in?
    if not request.user == AnonymousUser:
        user = request.user
        # Do we have enough data on the top 200 words?
        top_200_word_entries = language.get_word_entries(200)
        top_200_words = top_200_word_entries
        minimum_trials = 2
        insufficent_data_words = WordScore.objects.filter(user=user, word__in=top_200_words, count__lt=minimum_trials)
        if insufficent_data_words.count():
            pass


class RecordScores(APIView):
    """
    Record word and bigram scores in the session
    """

    def post(self, request):
        if 'word_scores' not in request.data or 'bigram_scores' not in request.data\
                or not isinstance(request.data['word_scores'], list)\
                or not isinstance(request.data['bigram_scores'], list):
            return Response("Invalid request", status=status.HTTP_400_BAD_REQUEST)

        print(request.user)
        print(request.auth)
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
            today = datetime.date.today()
            for word_score in request.data['word_scores']:
                try:
                    word_score['user'] = request.user
                    word_score['typos'] = 0
                    word_score['date'] = today
                    word_score['average_time'] = int(word_score['average_time'])
                except KeyError:
                    print('KeyError while parsing word scores, continuing...')
                    continue
            for bigram_score in request.data['bigram_scores']:
                try:
                    bigram_score['user'] = request.user
                    bigram_score['date'] = today
                    bigram_score['average_time'] = int(bigram_score['average_time'])
                except KeyError:
                    print('KeyError while parsing bigram scores, continuing...')
            try:
                word_scores = request.data['word_scores']
                bigram_scores = request.data['bigram_scores']
                word_score_serializer = WordScoreSerializer(data=request.data['word_scores'], many=True)
                bigram_score_serializer = BigramScoreSerializer(data=request.data['bigram_scores'], many=True)
                if all([word_score_serializer.is_valid(), bigram_score_serializer.is_valid()]):
                    word_score_serializer.save()
                    bigram_score_serializer.save()
                    return Response(status=status.HTTP_201_CREATED)
                errors = [word_score_serializer.errors, bigram_score_serializer.errors]
                return Response(errors, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
