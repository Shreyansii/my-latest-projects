from django.urls import path
from . import views

urlpatterns = [
    # Brand
    path('brands/', views.brand_list_create, name='brand-list'),
    path('brands/<int:pk>/', views.brand_detail, name='brand-detail'),

    # Category
    path('categories/', views.category_list_create, name='category-list'),
    path('categories/<int:pk>/', views.category_detail, name='category-detail'),

    # Product
    path('products/', views.product_list_create, name='product-list'),
    path('products/<int:pk>/', views.product_detail, name='product-detail'),
]
