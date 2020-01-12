from django.urls import path
from . import views

urlpatterns = [
    path('биография/', views.биография, name='биография'),
    path('biography/', views.biography, name='biography'),
    path('biographie/', views.biographie, name='biographie'),
]
