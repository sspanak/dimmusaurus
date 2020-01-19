from django.conf import settings
from django.http import Http404, HttpResponseRedirect
from django.shortcuts import render, get_object_or_404
from django.utils.translation import gettext, activate, get_language
from .models import AlbumDetails, SongLyrics, Song


def render_albums(request, album_id=None):
    lang = get_language()

    albums = AlbumDetails.objects.filter(language=lang).select_related('album').order_by('-album__release_date')

    if album_id:
        selected_album = get_object_or_404(albums, album__id=album_id)

        context = {
            'albums': albums,
            'page_albums': [selected_album],
            'page': {
                'url': 'music/albums/',
                'url_slug': selected_album.album_id,
                'url_slug_operation': '/switch_language/',
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
    song = get_object_or_404(Song, pk=song_id)
    song_album = get_object_or_404(song.album.albumdetails_set, language=lang)
    song_description = get_object_or_404(song.songdescription_set, language=lang)
    song_title = song_description.title or song.original_title

    context = {
        'albums': albums,
        'song': song,
        'song_album': song_album,
        'song_description': song_description,
        'song_title': song_title,
        'page': {
                'url': 'music/songs/',
                'url_slug': '%d-%s' % (song.id, song.slug),
                # Translators: Song page title
                'title': '%s | %s' % (song_title, gettext('Song Details')),
                # Translators: Song page description
                'description': '%s. %s' % (song_title, gettext('Detailed information and song lyrics. Download link.')),
            }
    }

    response = render(request, 'music/song.html', context)

    response.set_cookie(settings.LANGUAGE_COOKIE_NAME, lang)
    return response


def render_lyrics(request, song_id):
    lang = get_language()

    albums = AlbumDetails.objects.filter(language=lang).select_related('album').order_by('-album__release_date')
    lyrics = get_object_or_404(SongLyrics, song__id=song_id)
    this_song = get_object_or_404(lyrics.song.songdescription_set, language=lang)
    this_album = get_object_or_404(lyrics.song.album.albumdetails_set, language=lang)

    this_song_title = this_song.title or lyrics.song.original_title

    context = {
        'albums': albums,
        'lyrics': lyrics,
        'song': this_song,
        'song_title': this_song_title,
        'album': this_album,
        'page': {
                'url': 'music/songs/',
                'url_slug': '%d-%s' % (lyrics.song_id, lyrics.song.slug),
                'url_slug_operation': '/lyrics/',
                # Translators: Lyrics page title
                'title': '%s | %s' % (this_song_title, gettext('Song Lyrics')),
                # Translators: Lyrics page description
                'description': '%s. %s' % (this_song_title, gettext('Song lyrics and English translation.')),
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
