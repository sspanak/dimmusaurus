from django.conf import settings
from django.http import Http404
from django.shortcuts import render, redirect
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
