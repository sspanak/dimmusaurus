from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('начало/', views.начало, name='начало'),
    path('home/', views.home, name='home'),
    path('accueil/', views.accueil, name='accueil'),
]
