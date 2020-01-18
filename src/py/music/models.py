from django.db import models


class Album(models.Model):
    release_date = models.DateField('release date', null=True, blank=True)

    def __str__(self):
        return '%d | %s' % (self.id, self.release_date)


class AlbumDetails(models.Model):
    album = models.ForeignKey(Album, on_delete=models.CASCADE)
    description = models.TextField(null=True, blank=True)
    language = models.CharField(max_length=2)
    slug = models.SlugField(allow_unicode=True)
    title = models.CharField(max_length=255)

    def __str__(self):
        return '%d | %s | %s' % (self.album.id, self.language, self.title)
