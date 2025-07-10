from django.urls import path
from . import views

urlpatterns = [

    # Author
    path('authors/', views.author_list_create, name='author-list'),
    path('authors/<int:pk>/', views.author_detail, name='author-detail'),

    # Category
    path('categories/', views.category_list_create, name='category-list'),
    path('categories/<int:pk>/', views.category_detail, name='category-detail'),

    # Post
    path('posts/', views.post_list_create, name='post-list'),
    path('posts/<int:pk>/', views.post_detail, name='post-detail'),

    # Filters
    path('posts/author/<int:author_id>/', views.posts_by_author, name='posts-by-author'),
    path('posts/category/<int:category_id>/', views.posts_by_category, name='posts-by-category'),
]
