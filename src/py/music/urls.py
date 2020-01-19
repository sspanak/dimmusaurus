from django.urls import path, re_path

from . import views

urlpatterns = [
    # All albums
    path('музика/', views.дискография, name='дискография'),
    path('music/', views.discography, name='discography'),
    path('musique/', views.discographie, name='discographie'),

    # Single album
    re_path(r'^музика/албуми/(?P<album_id>[^\-^/]+)', views.албум, name='албум'),
    re_path(r'^music/albums/(?P<album_id>[^\-^/]+)', views.album_en, name='album_en'),
    re_path(r'^musique/albums/(?P<album_id>[^\-^/]+)', views.album_fr, name='album_fr'),

    # Song
    re_path(r'^музика/песни/(?P<song_id>\d+)[^\/]*\/*$', views.песен, name='песен'),
    re_path(r'^music/songs/(?P<song_id>\d+)[^\/]*\/*$', views.song, name='song'),
    re_path(r'^musique/chansons/(?P<song_id>\d+)[^\/]*\/*$', views.chanson, name='chanson'),

    # Lyrics
    re_path(r'^музика/песни/(?P<song_id>\d+)[^\/]*/текст/$', views.текст, name='текст'),
    re_path(r'^music/songs/(?P<song_id>\d+)[^\/]*/lyrics/$', views.lyrics, name='lyrics'),
    re_path(r'^musique/chansons/(?P<song_id>\d+)[^\/]*/paroles/$', views.paroles, name='paroles'),

    # non-existing but meaninful URLs
    re_path(r'^(?:музика/песни|music/songs|musique/chansons)/*$', views.random_invalid_route, name='music_index'),
    re_path(r'^(?:музика/албуми|music/albums|musique/albums)/*$', views.random_invalid_route, name='music_index'),
]
