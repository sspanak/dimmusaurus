from django.conf import settings
from django.shortcuts import render, redirect
from django.utils.translation import gettext, activate, get_language

from music.models import AlbumDetails
from music.shortcuts import get_music_menu_album_list


def render_page(request):
    lang = get_language()

    response = render(
        request,
        'bio/bio-%s.md' % lang,
        {
            'albums': get_music_menu_album_list(lang),
            'page': {
                'base_url': 'http://%s%s' % (settings.SITE_HOST, settings.SITE_PORT),
                'url': 'biography/',
                # Translators: Biography page title
                'title': gettext('Biography'),
                # Translators: Biography page description
                'description': gettext('The story of Dimmu Saurus project'),
            }
        }
    )

    response.set_cookie(settings.LANGUAGE_COOKIE_NAME, lang)
    return response


def биография(request):
    activate('bg')
    return render_page(request)


def biography(request):
    activate('en')
    return render_page(request)


def biographie(request):
    activate('fr')
    return render_page(request)
