from django.db import models
from django.conf import settings


class News(models.Model):
    pub_date = models.DateField('date published')
    language = models.CharField(max_length=2, choices=settings.LANGUAGES)
    title = models.CharField(max_length=255)
    body = models.TextField()

    def __str__(self):
        return "%s | %s | %s" % (self.pub_date, self.language, self.title)


class DbVersion(models.Model):
    computer_id = models.CharField(max_length=128)
    export_date = models.DateTimeField('export date')
    filename = models.CharField(max_length=255)
