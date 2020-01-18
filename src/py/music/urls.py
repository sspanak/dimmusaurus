from django.urls import path, re_path

from . import views

urlpatterns = [
    path('музика/', views.дискография, name='дискография'),
    path('music/', views.discography, name='discography'),
    path('musique/', views.discographie, name='discographie'),

    path('музика/албуми/', views.албум, name='албум'),
    path('music/albums/', views.album_en, name='album_en'),
    path('musique/albums/', views.album_fr, name='album_fr'),
]
