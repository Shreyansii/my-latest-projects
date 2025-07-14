from django.urls import path
from . import views

urlpatterns = [
    path('authors/', views.author_list_create),
    path('authors/<int:pk>/', views.author_detail),

    path('publishers/', views.publisher_list_create),
    path('publishers/<int:pk>/', views.publisher_detail),

    path('books/', views.book_list_create),
    path('books/<int:pk>/', views.book_detail),

    path('members/', views.member_list_create),
    path('members/<int:pk>/', views.member_detail),

    path('borrowings/', views.borrowing_list_create),
    path('borrowings/<int:pk>/', views.borrowing_detail),
]
