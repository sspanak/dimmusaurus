from django.conf import settings
from django.shortcuts import render, redirect
from django.utils.translation import gettext, activate, get_language


def render_page(request):
    response = render(
        request,
        'main/index.html',
        {
            'page': {
                'url': 'home/',
                'title': gettext('Home Page'),
                'description': gettext('Music from the garage... without rules or restrictions'),
            }
        }
    )

    response.set_cookie(settings.LANGUAGE_COOKIE_NAME, get_language())
    return response


def index(request):
    browser_language = getattr(request, 'LANGUAGE_CODE', settings.LANGUAGE_CODE)
    if browser_language == 'bg':
        return redirect('начало')
    elif browser_language == 'fr':
        return redirect('accueil')
    else:
        return redirect('home')

    return response


def начало(request):
    activate('bg')
    return render_page(request)


def home(request):
    activate('en')
    return render_page(request)


def accueil(request):
    activate('fr')
    return render_page(request)
