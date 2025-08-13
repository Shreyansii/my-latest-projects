
from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.CategoryListCreateView.as_view(), name='categories'),  
    path('activities/', views.ActivityLogListView.as_view(), name='activity_logs'), # Changed from 'activity-logs/' to 'activities/'
]