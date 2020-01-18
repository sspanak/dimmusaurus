from django.conf import settings
from django.shortcuts import render, redirect
from django.utils.translation import gettext, activate, get_language


def render_albums(request, single=False):
    if single:
        context = {
            'page': {
                'url': 'music/albums/[[ALBUM_URL]]',
                'title': '[[ALBUM NAME]]',
                'description': '[[ALBUM NAME]]. %s ' % gettext('Track list and information.'),
                'single_album': True,
            }
        }
    else:
        context = {
            'page': {
                'url': 'music/',
                # Translators: Discography page title
                'title': gettext('Discography'),
                # Translators: Discography page description
                'description': gettext('Dimmu Saurus Discography'),
            }
        }

    response = render(request, 'music/discography.html', context)

    response.set_cookie(settings.LANGUAGE_COOKIE_NAME, get_language())
    return response


def дискография(request):
    activate('bg')
    return render_albums(request)


def discography(request):
    activate('en')
    return render_albums(request)


def discographie(request):
    activate('fr')
    return render_albums(request)


def албум(request):
    activate('bg')
    return render_albums(request, True)


def album_en(request):
    activate('en')
    return render_albums(request, True)


def album_fr(request):
    activate('fr')
    return render_albums(request, True)
