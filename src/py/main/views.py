from django.http import HttpResponse
from django.shortcuts import render
from django.template import loader
from django.utils.translation import gettext, activate


def render_page(request):
    return render(
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


def index(request):
    return HttpResponse('Determine language here then redirect to appropriate view')


def начало(request):
    activate('bg')
    return render_page(request)


def home(request):
    activate('en')
    return render_page(request)


def accueil(request):
    activate('fr')
    return render_page(request)
