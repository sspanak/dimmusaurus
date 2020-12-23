from re import sub
from django.db import connection
from .models import AlbumDetails, SongDescription


def get_music_menu_album_list(language):
    return AlbumDetails.objects.filter(language=language) \
        .select_related('album') \
        .order_by('-album__release_date') \
        .only(
            'album__id', 'album__release_date',
            'title', 'slug', 'album_id'
        )


def get_all_songs(language, album_id=None):
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

    if album_id:
        songs.filter(song__album_id=album_id)

    return songs


def get_album_language_urls(album_id):
    albums = AlbumDetails.objects.filter(album_id=album_id).only('album_id', 'language', 'slug')

    slugs = {}
    for album in albums:
        slugs[album.language] = '%d-%s/' % (album.album_id, album.slug)
    return slugs


def get_album_durations():
    with connection.cursor() as cursor:
        cursor.execute(
            'SELECT \
                TIME(SUM(STRFTIME("%s", length)), "unixepoch") AS album_length, \
                album_id \
            FROM music_song \
            GROUP BY album_id'
        )

        return [
            {'album_id': row[1], 'album_duration': sub('00:0?', '', row[0])} for row in cursor.fetchall()
        ]
