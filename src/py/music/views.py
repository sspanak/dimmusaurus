from django.conf import settings
from django.shortcuts import render, redirect
from django.utils.translation import gettext, activate, get_language


def render_discography(request):
    language = get_language()

    response = render(
        request,
        'music/discography.html',
        {
            'page': {
                'url': 'music/',
                # Translators: Discography page title
                'title': gettext('Discography'),
                # Translators: Discography page description
                'description': gettext('Dimmu Saurus Discography'),
            }
        }
    )

    response.set_cookie(settings.LANGUAGE_COOKIE_NAME, language)
    return response


def дискография(request):
    activate('bg')
    return render_discography(request)


def discography(request):
    activate('en')
    return render_discography(request)


def discographie(request):
    activate('fr')
    return render_discography(request)
