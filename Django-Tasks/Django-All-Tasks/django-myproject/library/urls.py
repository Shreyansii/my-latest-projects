from django.urls import path
from . import views





urlpatterns = [

    path('', views.library_home, name='library_home'),

    path('books/', views.book_list, name='book_list'),
    path('books/add/', views.add_book, name='add_book'),
    path('books/edit/<int:pk>/', views.edit_book, name='edit_book'),
    path('books/delete/<int:pk>/', views.delete_book, name='delete_book'),

    path('borrowings/', views.borrowing_list, name='borrowing_list'),
    path('borrowings/add/', views.add_borrowing, name='add_borrowing'),
    path('borrowings/mark-returned/<int:pk>/', views.mark_returned, name='mark_returned'),
]
