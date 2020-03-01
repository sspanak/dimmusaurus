from .models import AlbumDetails, SongDescription


def get_music_menu_album_list(language):
    return AlbumDetails.objects.filter(language=language) \
        .select_related('album') \
        .order_by('-album__release_date') \
        .only(
            'album__id', 'album__release_date',
            'title', 'slug', 'album_id'
        )


def get_all_songs(language):
    songs = SongDescription.objects.select_related('song').filter(language=language)
    songs = songs.order_by('-song__album_id', 'song__album_order', 'song__release_date')
    songs = songs.only(
        'song__id',
        'song__album_id',
        'song__original_title',
        'song__length',
        'song__slug',
        'song__is_hidden',
        'title'
    )

    return songs
