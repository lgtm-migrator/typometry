from django.http import JsonResponse
from words.models import Language


def word_list(request):
    """
    Returns a JSON response containing a list of 100 random words of English, sampled from a distribution representing
    their frequency of use.
    """
    if request.method == 'GET':
        # TODO: Make this language-agnostic
        # modify session, test
        request.session['test'] = 'test09090'
        english = Language.objects.first()
        words = english.get_samples(100, 5000)
        words = [word.word.text for word in words]
        words.append(request.session['test'])
        return JsonResponse(words, safe=False)
