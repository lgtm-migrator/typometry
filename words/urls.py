from django.urls import path
from words import views


urlpatterns = [
    path('', views.word_list),
    path('metrics/', views.record_scores),
]