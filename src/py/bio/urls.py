from django.urls import re_path
from . import views

urlpatterns = [
    re_path(r'(?:api/)?биография/', views.биография, name='биография'),
    re_path(r'(?:api/)?biography/', views.biography, name='biography'),
    re_path(r'(?:api/)?biographie/', views.biographie, name='biographie'),
]
