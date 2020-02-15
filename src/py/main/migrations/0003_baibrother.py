# Generated by Django 3.0.2 on 2020-02-15 07:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0002_auto_20200119_1231'),
    ]

    operations = [
        migrations.CreateModel(
            name='BaiBrother',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('session_key', models.CharField(max_length=32)),
                ('ip_address', models.GenericIPAddressField()),
                ('url', models.URLField(max_length=1024)),
                ('referrer', models.URLField(max_length=1024)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
