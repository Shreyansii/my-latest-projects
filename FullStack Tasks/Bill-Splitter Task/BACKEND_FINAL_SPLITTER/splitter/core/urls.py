from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.CategoryListCreateView.as_view(), name='categories'),  
    path('activity-logs/', views.ActivityLogListView.as_view(), name='activity_logs'),
]
