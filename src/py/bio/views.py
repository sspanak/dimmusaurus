from django.conf import settings
from django.shortcuts import render, redirect
from django.utils.translation import gettext, activate, get_language


def render_page(request):
    language = get_language()

    response = render(
        request,
        'bio/bio-%s.md' % language,
        {
            'page': {
                'url': 'biography/',
                # Translators: Biography page title
                'title': gettext('Biography'),
                # Translators: Biography page description
                'description': gettext('The story of Dimmu Saurus project'),
            }
        }
    )

    response.set_cookie(settings.LANGUAGE_COOKIE_NAME, language)
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
