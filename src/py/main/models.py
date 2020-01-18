from django.db import models


class News(models.Model):
    pub_date = models.DateField('date published')
    language = models.CharField(max_length=2)
    title = models.CharField(max_length=255)
    body = models.TextField()
