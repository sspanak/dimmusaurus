from django.conf import settings
from django.http import Http404, HttpResponseRedirect
from django.shortcuts import render
from django.utils.translation import gettext, activate, get_language
from .models import AlbumDetails


def render_albums(request, album_id=None):
    lang = get_language()

    albums = AlbumDetails.objects.filter(language=lang).select_related('album').order_by('-album__release_date')

    if album_id:
        try:
            selected_album = albums.filter(album__id=album_id)[0]
        except IndexError:
            raise Http404

        context = {
            'albums': albums,
            'page_albums': [selected_album],
            'page': {
                'url': 'music/albums/',
                'url_slug': '%s/switch_language' % selected_album.album.id,
                'title': selected_album.title,
                'description': '%s. %s' % (selected_album.title, gettext('Track list and information.')),
                'single_album': True,
            }
        }
    else:
        context = {
            'albums': albums,
            'page_albums': albums,
            'page': {
                'url': 'music/',
                # Translators: Discography page title
                'title': gettext('Discography'),
                # Translators: Discography page description
                'description': gettext('Dimmu Saurus Discography'),
            }
        }

    response = render(request, 'music/discography.html', context)

    response.set_cookie(settings.LANGUAGE_COOKIE_NAME, lang)
    return response


def render_song(request, song_id):
    lang = get_language()

    albums = AlbumDetails.objects.filter(language=lang).select_related('album').order_by('-album__release_date')

    context = {
        'albums': albums,
        'page': {
                'url': 'music/songs/',
                'title': 'XXX',
                # Translators: Song page description
                'description': '%s. %s' % ('XXX', gettext('Detailed information and song lyrics. Download link.')),
            }
    }

    response = render(request, 'music/song.html', context)

    response.set_cookie(settings.LANGUAGE_COOKIE_NAME, lang)
    return response


def render_lyrics(request, song_id):
    lang = get_language()

    albums = AlbumDetails.objects.filter(language=lang).select_related('album').order_by('-album__release_date')

    context = {
        'albums': albums,
        'page': {
                'url': 'music/songs/',
                # Translators: Lyrics page title
                'title': gettext('Song Lyrics'),
                # Translators: Lyrics page description
                'description': '%s. %s' % ('XXX', gettext('Song lyrics and English translation.')),
            }
    }

    response = render(request, 'music/lyrics.html', context)

    response.set_cookie(settings.LANGUAGE_COOKIE_NAME, lang)
    return response


def random_invalid_route(request):

    browser_language = getattr(request, 'LANGUAGE_CODE', settings.LANGUAGE_CODE)
    if browser_language == 'bg':
        redirect = HttpResponseRedirect('/музика/')
    elif browser_language == 'fr':
        redirect = HttpResponseRedirect('/musique/')
    else:
        redirect = HttpResponseRedirect('/music/')

    redirect.status_code = 301
    return redirect


# ######### All Albums Overview ######### #
def дискография(request):
    activate('bg')
    return render_albums(request)


def discography(request):
    activate('en')
    return render_albums(request)


def discographie(request):
    activate('fr')
    return render_albums(request)


# ######### Single Album View ######### #
def албум(request, album_id):
    activate('bg')
    return render_albums(request, album_id)


def album_en(request, album_id):
    activate('en')
    return render_albums(request, album_id)


def album_fr(request, album_id):
    activate('fr')
    return render_albums(request, album_id)


# ######### Song View ######### #
def песен(request, song_id):
    activate('bg')
    return render_song(request, song_id)


def song(request, song_id):
    activate('en')
    return render_song(request, song_id)


def chanson(request, song_id):
    activate('fr')
    return render_song(request, song_id)


# ######### Lyrics View ######### #
def текст(request, song_id):
    activate('bg')
    return render_lyrics(request, song_id)


def lyrics(request, song_id):
    activate('en')
    return render_lyrics(request, song_id)


def paroles(request, song_id):
    activate('fr')
    return render_lyrics(request, song_id)
