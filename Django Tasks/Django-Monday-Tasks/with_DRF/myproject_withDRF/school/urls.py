from django.urls import path
from . import views

urlpatterns = [
    path('departments/', views.department_list_create),
    path('departments/<int:pk>/', views.department_detail),

    path('courses/', views.course_list_create),
    path('courses/<int:pk>/', views.course_detail),

    path('students/', views.student_list_create),
    path('students/<int:pk>/', views.student_detail),

    path('enrollments/', views.enrollment_list_create),
    path('enrollments/<int:pk>/', views.enrollment_detail),
]
