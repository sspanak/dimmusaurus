from django.http import HttpResponse
from django.shortcuts import render
from django.template import loader


def index(request):
    return HttpResponse("Determine language here then redirect to appropriate view")


def начало(request):
    context = {
        'page_name': 'Начало',
        'news_title': 'Новини'
    }

    return render(request, 'main/начало.html', context)


def home(request):
    context = {
        'page_name': 'Home',
        'news_title': 'News'
    }

    return render(request, 'main/home.html', context)


def accueil(request):
    context = {
        'page_name': 'Accueil',
        'news_title': 'Nouvelles'
    }

    return render(request, 'main/accueil.html', context)
