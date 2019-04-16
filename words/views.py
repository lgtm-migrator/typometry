from django.http import JsonResponse
from words.models import Language, Word, Bigram
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from words.serializers import WordScoreSerializer, BigramScoreSerializer
from words.models import WordScore, BigramScore
from django.contrib.auth.models import AnonymousUser
import datetime
import random
import numpy as np


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
    if request.user.is_authenticated:
        user = request.user
        # Do we have enough data on the top 200 words?
        top_200_words = language.get_words(200)
        minimum_trials = 4
        score_timeframe_days = 14
        score_after_date = datetime.date.today() - datetime.timedelta(days=score_timeframe_days)
        sufficient_data_words = WordScore.objects.filter(user=user.profile,
                                                         word__in=top_200_words,
                                                         count__gte=minimum_trials,
                                                         date__gte=score_after_date)
        sufficient_data_words = [word.word.text for word in sufficient_data_words]
        insufficient_data_words = [word.text for word in top_200_words if word.text not in sufficient_data_words]

        top_400_bigrams = language.get_bigrams(400)
        sufficient_data_bigrams = BigramScore.objects.filter(user=user.profile,
                                                             bigram__in=top_400_bigrams,
                                                             count__gte=minimum_trials,
                                                             date__gte=score_after_date)
        sufficient_data_bigrams = [bigram.bigram.bigram for bigram in sufficient_data_bigrams]
        insufficient_data_bigrams = \
            [bigram.bigram for bigram in top_400_bigrams if bigram.bigram not in sufficient_data_bigrams]

        if len(insufficient_data_words) > 0:
            practice_words = [word for word in insufficient_data_words]
            print(practice_words)
            print(str(len(practice_words)) + ' words remain')
            print('Insufficient word data for smart exercise')
            return JsonResponse(practice_words, safe=False)

        elif len(insufficient_data_bigrams) > 0:
            practice_words = []
            for bigram in insufficient_data_bigrams:
                practice_words.extend(language.get_samples_for_bigram(bigram, 5))
            print(practice_words)
            print(str(len(practice_words)) + ' words remain')
            print('Insufficient bigram data for smart exercise')
            return JsonResponse(practice_words, safe=False)

        else:
            # Identify weaknesses in user's typing
            print('Creating smart exercise')
            # Flip a coin: words or bigrams?
            check_words_first = (random.randint(0, 1) == 1)

            # Get typing info from the last 14 days
            recent_scores = user.profile.get_recent_scores(14, word_score=check_words_first)

            q1, q3 = np.percentile(list(recent_scores.values()), [25, 75])
            iqr = q3 - q1
            upper_bound = q3 + (1.2 * iqr)

            # Find outliers
            practice_words = []
            if check_words_first:
                practice_words = [word for word, speed in recent_scores.items() if speed > upper_bound]
            if not practice_words or not check_words_first:
                # Create bigram exercise
                practice_bigrams = [bigram for bigram, speed in recent_scores.items() if speed > upper_bound]
                for bigram in practice_bigrams:
                    practice_words.extend(language.get_samples_for_bigram(bigram, 10))

            return JsonResponse(practice_words, safe=False)

    else:
        # User not logged in
        return JsonResponse(['Please', 'log', 'in!'], safe=False)


class RecordScores(APIView):
    """
    Record word and bigram scores in the session
    """

    def post(self, request):
        if 'word_scores' not in request.data or 'bigram_scores' not in request.data \
                or not isinstance(request.data['word_scores'], list) \
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
                word_score_serializer = WordScoreSerializer(data=word_scores, many=True)
                bigram_score_serializer = BigramScoreSerializer(data=bigram_scores, many=True)
                if all([word_score_serializer.is_valid(), bigram_score_serializer.is_valid()]):
                    word_score_serializer.save()
                    bigram_score_serializer.save()
                    return Response(status=status.HTTP_201_CREATED)
                errors = [word_score_serializer.errors, bigram_score_serializer.errors]
                return Response(errors, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
