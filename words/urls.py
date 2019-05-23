from django.urls import path
from words import views


urlpatterns = [
    path('', views.word_list),
    path('smart/', views.smart_exercise),
    path('metrics/', views.RecordScores.as_view()),
    path('stats/<str:word>/', views.GetWordStats.as_view()),
    path('long-text/<str:text>/<int:paragraph>/', views.GetLongText.as_view())
]