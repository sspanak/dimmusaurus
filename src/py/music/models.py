from re import sub
from django.db import models
from django.conf import settings
from django.utils.translation import gettext


class Album(models.Model):
    release_date = models.DateField('release date', null=True, blank=True)

    def __str__(self):
        return '%d | %s' % (self.id, self.release_date)


class AlbumDetails(models.Model):
    album = models.ForeignKey(Album, on_delete=models.CASCADE, related_name='album_details')
    description = models.TextField(null=True, blank=True)
    language = models.CharField(max_length=2, choices=settings.LANGUAGES)
    slug = models.SlugField(allow_unicode=True)
    title = models.CharField(max_length=255)

    class Meta:
        unique_together = ('album', 'language')

    def get_absolute_url(self):
        return '/%s%d-%s/' % (gettext('music/albums/'), self.album_id, self.slug)

    def __str__(self):
        return '%d | %s | %s' % (self.album_id, self.language, self.title)


class Song(models.Model):
    album = models.ForeignKey(Album, on_delete=models.CASCADE, related_name='songs')
    is_hidden = models.BooleanField('is hidden')
    length = models.TimeField()
    release_date = models.DateField('release date')
    slug = models.SlugField(allow_unicode=True)
    original_title = models.CharField('original title', max_length=255)
    youtube = models.URLField('youtube link', null=True, blank=True)
    album_order = models.PositiveSmallIntegerField('album order', default=0)

    @property
    def duration(self):
        return sub('^0', '', self.length.strftime('%M:%S'))

    def get_absolute_url(self):
        return '/%s%d-%s/' % (gettext('music/songs/'), self.id, self.slug)

    def get_lyrics_url(self):
        return '%s%s' % (self.get_absolute_url()[:-1], gettext('/lyrics/'))

    def get_download_url(self):
        return '%s%s' % (self.get_absolute_url()[:-1], gettext('/download/'))

    def __str__(self):
        return '%d | %s' % (self.id, self.original_title)


class SongDescription(models.Model):
    song = models.ForeignKey(Song, on_delete=models.CASCADE, related_name='song_descriptions')
    description = models.TextField()
    language = models.CharField(max_length=2, choices=settings.LANGUAGES)
    title = models.CharField(max_length=255, null=True, blank=True)

    @property
    def translated_title(self):
        return self.title or self.song.original_title

    class Meta:
        unique_together = ('song', 'language')

    def __str__(self):
        return '%d | %s | %s' % (self.song_id, self.language, self.title)


class SongFile(models.Model):
    song = models.ForeignKey(Song, on_delete=models.CASCADE, related_name='song_files')
    file_name = models.CharField('file name', max_length=255)
    file_type = models.CharField(
        'file type',
        max_length=35,
        choices=[
            ('aac', 'Advanced Audio Codec'),
            ('ogg', 'Ogg Vorbis'),
            ('opus', 'Opus'),
        ]
    )

    class Meta:
        unique_together = ('song', 'file_type')

    @property
    def playlist_url(self):
        return '%sdownload/%s' % (settings.STATIC_URL, self.file_name)

    def get_absolute_path(self):
        return '%s/download/%s' % (settings.STATICFILES_DIRS[0], self.file_name)

    def __str__(self):
        return '%d | %s' % (self.song_id, self.file_name)


class SongLyrics(models.Model):
    song = models.OneToOneField(Song, on_delete=models.CASCADE, related_name='song_lyrics')
    title = models.CharField('original title', max_length=255)
    lyrics = models.TextField()
    english_title = models.CharField('english title', max_length=255, null=True, blank=True)
    english_lyrics = models.TextField('english lyrics', null=True, blank=True)

    def __str__(self):
        return '%d | %s' % (self.song_id, self.title)
