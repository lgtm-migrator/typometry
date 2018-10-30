from django.http import HttpResponse, JsonResponse
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from words.models import Word, Language
from words.serializers import WordSerializer


def word_list(request):
    if request.method == 'GET':
        # TODO: Make this language-agnostic
        english = Language.objects.all()[0]
        words = english.get_samples(100, 5000)
        words = [word.text for word in words]
        return JsonResponse(words, safe=False)
