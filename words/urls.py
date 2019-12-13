from django.urls import path
from words import views


urlpatterns = [
    path('', views.word_list),
    path('smart/', views.smart_exercise),
    path('metrics/', views.RecordScores.as_view()),
    path('scores/<str:type>/<int:top_n>/', views.GetScores.as_view()),
    path('top/<int:top_n>/', views.GetTopBigrams.as_view()),
    path('stats/<str:word>/', views.GetWordStats.as_view()),
    path('long-text/<str:text>/<int:paragraph>/', views.GetLongText.as_view()),
    path('settings/', views.UserSettings.as_view()),
]