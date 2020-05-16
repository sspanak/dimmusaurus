from django.urls import path, re_path
from django.views.generic.base import RedirectView

from . import views

urlpatterns = [
    # All albums
    re_path(r'^(?:api/)?музика/$', views.дискография, name='дискография'),
    re_path(r'^(?:api/)?music/$', views.discography, name='discography'),
    re_path(r'^(?:api/)?musique/$', views.discographie, name='discographie'),

    # Single album
    re_path(r'^(?:api/)?музика/албуми/(?P<album_id>\d+)[^/]*/$', views.албум, name='албум'),
    re_path(r'^(?:api/)?music/albums/(?P<album_id>\d+)[^/]*/$', views.album_en, name='album_en'),
    re_path(r'^(?:api/)?musique/albums/(?P<album_id>\d+)[^/]*/$', views.album_fr, name='album_fr'),

    # Song
    re_path(r'^(?:api/)?музика/песни/(?P<song_id>\d+)[^\/]*\/$', views.песен, name='песен'),
    re_path(r'^(?:api/)?music/songs/(?P<song_id>\d+)[^\/]*\/$', views.song, name='song'),
    re_path(r'^(?:api/)?musique/chansons/(?P<song_id>\d+)[^\/]*\/$', views.chanson, name='chanson'),

    # Lyrics
    re_path(r'^(?:api/)?музика/песни/(?P<song_id>\d+)[^\/]*/текст/$', views.текст, name='текст'),
    re_path(r'^(?:api/)?music/songs/(?P<song_id>\d+)[^\/]*/lyrics/$', views.lyrics, name='lyrics'),
    re_path(r'^(?:api/)?musique/chansons/(?P<song_id>\d+)[^\/]*/paroles/$', views.paroles, name='paroles'),

    # Downloads
    # We serve the files to force the browser download them instead of playing them
    re_path(r'^(?:api/)?музика/песни/(?P<song_id>\d+)[^\/]*/изтегли/$', views.download, name='download'),
    re_path(r'^(?:api/)?music/songs/(?P<song_id>\d+)[^\/]*/download/$', views.download, name='download'),
    re_path(r'^(?:api/)?musique/chansons/(?P<song_id>\d+)[^\/]*/telecharger/$', views.download, name='download'),

    # non-existing but meaninful URLs
    re_path(
        r'^(?:музика/песни|музика/албуми)/*$',
        RedirectView.as_view(url='/музика/'),
        name='дискография'
    ),
    re_path(
        r'^(?:music/songs|music/albums)/*$',
        RedirectView.as_view(url='/music/'),
        name='discography'
    ),
    re_path(
        r'^(?:musique/chansons|musique/albums)/*$',
        RedirectView.as_view(url='/musique/'),
        name='discographie'
    ),

    # Playlist (JSON only)
    path('api/music/playlist/bg/', views.плейлиста, name='playlist'),
    path('api/music/playlist/en/', views.playlist, name='playlist'),
    path('api/music/playlist/fr/', views.liste_de_lecture, name='playlist'),
]
