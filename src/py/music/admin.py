from django.contrib import admin
from .models import Album, AlbumDetails, Song, SongDescription, SongFile, SongLyrics

admin.site.register(Album)
admin.site.register(AlbumDetails)

admin.site.register(Song)
admin.site.register(SongDescription)
admin.site.register(SongFile)
admin.site.register(SongLyrics)
