from django.http import JsonResponse
from words.models import Language


def word_list(request):
    if request.method == 'GET':
        # TODO: Make this language-agnostic
        english = Language.objects.all()[0]
        words = english.get_samples(100, 5000)
        words = [word.word.text for word in words]
        return JsonResponse(words, safe=False)
