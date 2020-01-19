from django.urls import path, re_path

from . import views

urlpatterns = [
    path('музика/', views.дискография, name='дискография'),
    path('music/', views.discography, name='discography'),
    path('musique/', views.discographie, name='discographie'),

    re_path(r'^музика/албуми/(?P<album_id>[^\-^/]+)', views.албум, name='албум'),
    re_path(r'^music/albums/(?P<album_id>[^\-^/]+)', views.album_en, name='album_en'),
    re_path(r'^musique/albums/(?P<album_id>[^\-^/]+)', views.album_fr, name='album_fr'),
]
