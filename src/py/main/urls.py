from django.urls import path, re_path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    re_path(r'(?:api/)?начало/', views.начало, name='начало'),
    re_path(r'(?:api/)?home/', views.home, name='home'),
    re_path(r'(?:api/)?accueil/', views.accueil, name='accueil'),
    path('version/', views.version, name="version")
]
