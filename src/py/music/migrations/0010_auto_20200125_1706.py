# Generated by Django 3.0.2 on 2020-01-25 15:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('music', '0009_song_album_order'),
    ]

    operations = [
        migrations.AlterField(
            model_name='song',
            name='album_order',
            field=models.PositiveSmallIntegerField(blank=True, default=None, null=True, verbose_name='album order'),
        ),
    ]