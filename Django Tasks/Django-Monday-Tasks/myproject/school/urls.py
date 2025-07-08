from django.urls import path
from . import views

urlpatterns = [

        # Landing/Home Dashboard
    path('', views.school_home, name='school_home'),

    # Department
    path('departments/', views.department_list, name='department_list'),
    path('departments/create/', views.department_create, name='department_create'),

    # Course
    path('courses/', views.course_list, name='course_list'),
    path('courses/create/', views.course_create, name='course_create'),

    # Student
    path('students/', views.student_list, name='student_list'),
    path('students/create/', views.student_create, name='student_create'),

    # Enrollment
    path('enrollments/', views.enrollment_list, name='enrollment_list'),
    path('enrollments/create/', views.enrollment_create, name='enrollment_create'),
]
