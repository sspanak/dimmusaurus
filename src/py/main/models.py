from django.db import models
from django.conf import settings


class News(models.Model):
    pub_date = models.DateField('date published')
    language = models.CharField(max_length=2, choices=settings.LANGUAGES)
    title = models.CharField(max_length=255)
    body = models.TextField()

    def __str__(self):
        return "%s | %s | %s" % (self.pub_date, self.language, self.title)


class BaiBrother(models.Model):
    session_key = models.CharField(max_length=32)
    ip_address = models.GenericIPAddressField(max_length=15)
    url = models.URLField(max_length=1024)
    referrer = models.URLField(max_length=1024)
    timestamp = models.DateTimeField(auto_now_add=True)
