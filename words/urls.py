from django.urls import path
from words import views


urlpatterns = [
    path('', views.word_list),
    path('smart/', views.smart_exercise),
    path('metrics/', views.RecordScores.as_view()),
    path('scores/', views.get_scores),
    path('stats/<str:word>/', views.GetWordStats.as_view()),
    path('long-text/<str:text>/<int:paragraph>/', views.GetLongText.as_view()),
    path('settings/', views.UserSettings.as_view()),
]