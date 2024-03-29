from django.conf import settings
from django.shortcuts import redirect
from django.utils.translation import gettext, activate, get_language

from .models import News, DbVersion
from .shortcuts import render_template, get_version_info, is_text_browser
from music.shortcuts import get_music_menu_album_list


def version(request):
    lang = get_language()
    version_info = get_version_info()

    context = {
        **version_info,
        'albums': get_music_menu_album_list(language=lang),
        'db_info': DbVersion.objects.get(pk=1),
        'is_text_browser': is_text_browser(request),
        'page': {
            'base_url': settings.BASE_URL,
            'url': 'version/',
            'title': gettext('Version Info'),
            'description': gettext('Version Information'),
        }
    }

    return render_template(request, 'main/pages/version.html', context, lang)


def render_news(request):
    lang = get_language()
    version_info = get_version_info()

    return render_template(
        request,
        'main/pages/index.html',
        {
            'albums': get_music_menu_album_list(language=lang),
            'build': version_info.get('build'),
            'news': News.objects.filter(language=lang).order_by('-pub_date')[:10],
            'is_text_browser': is_text_browser(request),
            'page': {
                'base_url': settings.BASE_URL,
                'url': 'home/',
                'title': gettext('Home Page'),
                'description': gettext('Music from the garage... without rules or restrictions'),
            }
        },
        lang
    )


def languages(request):
    lang = get_language()
    version_info = get_version_info()

    return render_template(
        request,
        'main/pages/languages.html',
        {
            'albums': get_music_menu_album_list(language=lang),
            'build': version_info.get('build'),
            'is_text_browser': is_text_browser(request),
            'page': {
                'base_url': settings.BASE_URL,
                'url': 'home/', # we want to navigate back to the home page after making a choice
                'title': gettext('Change the Language'),
            }
        },
        lang
    )

def index(request):
    browser_language = getattr(request, 'LANGUAGE_CODE', settings.LANGUAGE_CODE)
    if browser_language == 'bg':
        return redirect('/начало/')
    elif browser_language == 'fr':
        return redirect('/accueil/')
    else:
        return redirect('/home/')


def начало(request):
    activate('bg')
    return render_news(request)


def home(request):
    activate('en')
    return render_news(request)


def accueil(request):
    activate('fr')
    return render_news(request)
