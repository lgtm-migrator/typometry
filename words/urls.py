from django.urls import path
from words import views


urlpatterns = [
    path('', views.word_list),
    path('smart/', views.smart_exercise),
    path('metrics/', views.RecordScores.as_view()),
]