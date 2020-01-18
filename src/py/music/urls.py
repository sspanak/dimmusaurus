from django.urls import path, re_path

from . import views

urlpatterns = [
    path('музика/', views.дискография, name='дискография'),
    path('music/', views.discography, name='discography'),
    path('musique/', views.discographie, name='discographie'),
]
