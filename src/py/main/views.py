from django.conf import settings
from django.shortcuts import render, redirect
from django.utils.translation import gettext, activate, get_language

from .models import News
from music.models import AlbumDetails


def render_page(request):
    lang = get_language()

    albums = AlbumDetails.objects.filter(language=lang).select_related('album').order_by('-album__release_date')
    news = News.objects.filter(language=lang).order_by('-pub_date')[:10]

    response = render(
        request,
        'main/index.html',
        {
            'albums': albums,
            'news': news,
            'page': {
                'url': 'home/',
                'title': gettext('Home Page'),
                'description': gettext('Music from the garage... without rules or restrictions'),
            },
        }
    )

    response.set_cookie(settings.LANGUAGE_COOKIE_NAME, lang)
    return response


def index(request):
    browser_language = getattr(request, 'LANGUAGE_CODE', settings.LANGUAGE_CODE)
    if browser_language == 'bg':
        return redirect('/начало')
    elif browser_language == 'fr':
        return redirect('/accueil')
    else:
        return redirect('/home')


def начало(request):
    activate('bg')
    return render_page(request)


def home(request):
    activate('en')
    return render_page(request)


def accueil(request):
    activate('fr')
    return render_page(request)
