from django.http import JsonResponse

from words import fingering
from words.models import Language
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from words.serializers import WordScoreSerializer, BigramScoreSerializer
from words.models import BigramScore, WordScore, LongText
import datetime
import numpy as np
import json


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

    def get_user_insufficient_data_bigrams(_request, _language):
        minimum_trials = 3
        top_113_bigrams = _language.get_bigrams(113)

        # Is user logged in?
        if _request.user.is_authenticated:
            score_timeframe_days = 14
            score_after_date = datetime.date.today() - datetime.timedelta(days=score_timeframe_days)
            sufficient_data_bigrams = BigramScore.objects.filter(user=user.profile,
                                                                 bigram__in=top_113_bigrams,
                                                                 count__gte=minimum_trials,
                                                                 date__gte=score_after_date)
            sufficient_data_bigrams = {bigram.bigram.bigram for bigram in sufficient_data_bigrams}

        else:  # Guest, use session scores
            if 'bigram_scores' not in _request.session or not isinstance(_request.session['bigram_scores'], list):
                print('No scores found for unauthenticated user')
                _request.session['bigram_scores'] = []
                _request.session.modified = True  # Required to get sessions working in Firefox for some reason
            user_bigram_scores = _request.session['bigram_scores']
            sufficient_data_bigrams = {bigram_score['bigram'] for bigram_score in user_bigram_scores
                                       if bigram_score['count'] >= minimum_trials}

        insufficient_data_bigrams = \
            [bigram.bigram for bigram in top_113_bigrams if bigram.bigram not in sufficient_data_bigrams]

        return insufficient_data_bigrams

    if not request.method == 'GET':
        error = {"You've come to the wrong place."}
        return Response(error, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    # TODO: Make this language-agnostic
    language = Language.objects.first()
    user = request.user
    insufficient_data_bigrams = get_user_insufficient_data_bigrams(request, language)

    if len(insufficient_data_bigrams) > 0:
        practice_words = []
        # Give exercises based on the rarest bigrams first -- the common ones will fill out naturally. This should
        # speed up the process of gathering data for a new user.
        insufficient_data_bigrams = insufficient_data_bigrams[-25:]
        for bigram in insufficient_data_bigrams:
            practice_words.extend(language.get_samples_for_bigram(bigram, 2))
        print(practice_words)
        print(str(len(practice_words)) + ' words remain')
        print('Insufficient bigram data for smart exercise')
        if len(practice_words) < 20:
            practice_words *= 3

        response = {
            'type': 'gatherData',
            'words': practice_words
        }
        return JsonResponse(response, safe=False)

    else:
        # Identify weaknesses in user's typing
        print('Creating smart exercise')

        if request.user.is_authenticated:
            # Get typing info from the last 14 days
            top_n = 113  # Top 113 bigrams represent 80% of bigrams by usage in US English
            recent_scores = user.profile.get_recent_scores(14, word_score=False, top_n=top_n)
            recent_scores = {bigram: time for bigram, time in recent_scores.items() if bigram[0] != ' '}
        else:
            recent_scores = request.session['bigram_scores']
            recent_scores = {score['bigram']: score for score in recent_scores}

        recent_scores_times = [score['average_time'] for score in recent_scores.values()]
        q1, q3 = np.percentile(recent_scores_times, [25, 75])
        iqr = q3 - q1
        upper_bound = q3 + (1.5 * iqr)

        # Create bigram exercise
        practice_bigrams = [bigram for bigram, score in recent_scores.items() if score['average_time'] > upper_bound]
        print('Found ' + str(len(practice_bigrams)) + ' bigrams to be practiced')
        practice_bigrams = practice_bigrams[:7]

        exercises = []

        for bigram in practice_bigrams:
            exercises.append({
                'text': bigram,
                'fingering': fingering.get_fingering(bigram),
                'words': language.get_samples_for_bigram(bigram, 30)
            })

        if not exercises:
            response = {
                'type': 'noExercise'
            }
            return JsonResponse(response, safe=False)

        response = {
            'type': 'bigramExercise',
            'exercises': exercises
        }
        return JsonResponse(response, safe=False)


class GetScores(APIView):
    """
    Takes requests for user scores
    """

    def get(self, request, *args, **kwargs):

        # TODO: Make this language-agnostic
        language = Language.objects.first()
        request_type = kwargs.get('type', None)
        top_n = kwargs.get('top_n', None)
        if type(top_n) != int or top_n <= 0:
            return Response('Invalid request', status.HTTP_400_BAD_REQUEST)

        if request_type == 'bigram':
            top_n_bigrams = language.get_bigram_entries(top_n)
            top_n_bigrams = [bigram.bigram.bigram for bigram in top_n_bigrams]
            if request.user.is_authenticated:
                score_timeframe_days = 14
                bigram_scores = request.user.profile.get_recent_scores(score_timeframe_days,
                                                                       word_score=False,
                                                                       top_n=top_n)
                bigram_scores = [{
                    'bigram': score[0],
                    'average_time': score[1]['average_time'],
                    'count': score[1]['count']}
                    for score in bigram_scores.items()]

            else:
                if 'bigram_scores' not in request.session or not isinstance(request.session['bigram_scores'], list):
                    print('No scores found for unauthenticated user')
                    request.session['bigram_scores'] = []
                bigram_scores = request.session['bigram_scores']
                bigram_scores = [bigram_score for bigram_score in bigram_scores
                                 if bigram_score['bigram'] in top_n_bigrams]

            response = {
                'bigram_scores': bigram_scores
            }
            return JsonResponse(response, safe=False)

        elif request_type == 'word':
            top_n_words = language.get_word_entries(top_n)
            top_n_words = [word.word.text for word in top_n_words]
            if request.user.is_authenticated:
                score_timeframe_days = 14
                score_after_date = datetime.date.today() - datetime.timedelta(days=score_timeframe_days)

                word_scores = list(WordScore.objects.filter(user=request.user.profile,
                                                            word__in=top_n_words,
                                                            date__gte=score_after_date)
                                   .values('word', 'average_time', 'count'))

            else:
                if 'word_scores' not in request.session or not isinstance(request.session['word_scores'], list):
                    print('No scores found for unauthenticated user')
                    request.session['word_scores'] = []
                word_scores = request.session['word_scores']
                word_scores = [word_score for word_score in word_scores if word_score['word'] in top_n_words]

            response = {
                'word_scores': word_scores
            }
            return JsonResponse(response, safe=False)

        else:
            return Response('Invalid request', status.HTTP_400_BAD_REQUEST)


class GetTopBigrams(APIView):
    """
    Returns top N bigrams from given language
    """

    def get(self, request, *args, **kwargs):
        # TODO: Make this language-agnostic
        language = Language.objects.first()
        top_n = kwargs.get('top_n', None)
        if type(top_n) != int or top_n <= 0:
            return Response('Invalid request', status.HTTP_400_BAD_REQUEST)

        top_n_bigrams = language.get_bigram_entries(top_n)
        top_n_bigrams = [bigram.bigram.bigram for bigram in top_n_bigrams]
        response = {
            'bigrams': top_n_bigrams
        }
        return JsonResponse(response, safe=False)


class UserSettings(APIView):
    """
    Manages user settings for consistency across sessions
    """

    def get(self, request):
        if not request.user.is_authenticated:
            return Response('Not logged in', status=status.HTTP_401_UNAUTHORIZED)

        settings_dict = json.loads(request.user.profile.settings)
        return JsonResponse(settings_dict, status=status.HTTP_200_OK)

    def post(self, request):
        if not request.user.is_authenticated:
            return Response('Not logged in', status=status.HTTP_401_UNAUTHORIZED)

        try:
            # Manually verify fields
            assert type(request.data['darkMode']) == bool
            assert len(request.data.items() == 1)

            # Update saved settings post verification
            request.user.profile.settings = json.dumps(request.data)
            request.user.profile.save()

        except Exception as e:
            print(e)
            return Response('Invalid request', status=status.HTTP_400_BAD_REQUEST)


class GetLongText(APIView):
    """
    Takes a request for a long text with paragraph number and returns text beginning at that paragraph.
    """

    def get(self, request, *args, **kwargs):
        request_text = kwargs.get('text', None)
        request_paragraph = kwargs.get('paragraph', None)
        if request_text is None or request_paragraph is None:
            print('Text requested: ' + request_text)
            print('Paragraph requested: ' + request_paragraph)
            return Response("Invalid request", status=status.HTTP_400_BAD_REQUEST)

        try:
            text_obj = LongText.objects.get(codeName=request_text)
            if text_obj is None:
                print('No text found for request: ' + request_text)
                return Response(status=status.HTTP_400_BAD_REQUEST)

            paragraphs = text_obj.text.split('\n')
            text_fragment = '\n'.join(paragraphs[request_paragraph:request_paragraph + 3])
            newCurrentParagraph = request_paragraph + 3
            words = text_fragment.split(' ')
            response = {
                'words': words,
                'newParagraph': newCurrentParagraph
            }
            print("Words: ")
            print(response['words'])
            return JsonResponse(response, safe=False)

        except Exception as e:
            print(e)
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetWordStats(APIView):
    """
    Get statistics about a word
    """

    def get(self, request, *args, **kwargs):
        request_word = kwargs.get('word', None)
        if request_word is None:
            return Response("Invalid request", status=status.HTTP_400_BAD_REQUEST)

        try:
            # TODO: Make this language-agnostic
            language = Language.objects.first()
            word = language.wordentry_set.get(word=request_word)
            average_frequency = language.total_word_occurrences / len(language.wordentry_set.all())
            relative_frequency = word.frequency / average_frequency

            if relative_frequency > 50:
                frequency_class = 0
            elif relative_frequency > 10:
                frequency_class = 1
            elif relative_frequency > 5:
                frequency_class = 2
            elif relative_frequency > 1:
                frequency_class = 3
            elif relative_frequency > 1 / 5:
                frequency_class = 4
            elif relative_frequency > 1 / 10:
                frequency_class = 5
            elif relative_frequency > 1 / 50:
                frequency_class = 6
            else:
                frequency_class = 7

            suggested_fingering = fingering.get_fingering(word.word.text)

            response = {
                'frequency': frequency_class,
                'fingering': suggested_fingering
            }

            return JsonResponse(response, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
        if not request.user.is_authenticated:
            if 'word_scores' not in request.session or not isinstance(request.session['word_scores'], list):
                request.session['word_scores'] = []
            request.session['word_scores'].extend(request.data['word_scores'])

            if 'bigram_scores' not in request.session or not isinstance(request.session['bigram_scores'], list):
                request.session['bigram_scores'] = []
            new_scores = request.data['bigram_scores']
            old_scores = request.session['bigram_scores']
            score_manifest = {score['bigram']: score for score in old_scores}
            for score in new_scores:
                if score['bigram'] in score_manifest.keys():
                    old_score = score_manifest[score['bigram']]
                    score_manifest[score['bigram']] = {
                        'bigram': score['bigram'],
                        'average_time': (score['average_time'] * score['count']) +
                                        (old_score['average_time'] * old_score['count']) /
                                        (old_score['count'] + score['count']),
                        'count': old_score['count'] + score['count']
                    }
                else:
                    score_manifest[score['bigram']] = score
            request.session['bigram_scores'] = [score_manifest[key] for key in score_manifest.keys()]
            request.session.modified = True  # Required to get sessions working in Firefox for some reason
            return Response(request.session['bigram_scores'], status=status.HTTP_200_OK)
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
