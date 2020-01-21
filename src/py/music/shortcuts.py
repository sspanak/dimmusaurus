from .models import AlbumDetails


def get_music_menu_album_list(language):
    return AlbumDetails.objects.filter(language=language) \
        .select_related('album') \
        .order_by('-album__release_date') \
        .only(
            'album__id', 'album__release_date',
            'title', 'slug', 'album_id'
        )
