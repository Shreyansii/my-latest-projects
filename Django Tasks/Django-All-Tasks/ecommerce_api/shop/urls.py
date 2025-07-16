# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import (
#     CategoryViewSet, ProductViewSet, 
#     CustomerOrderViewSet, AdminOrderViewSet,
#     PublicCategoryList, ActiveProductList
# )

# router = DefaultRouter()
# router.register('admin/categories', CategoryViewSet)
# router.register('admin/products', ProductViewSet)
# router.register('admin/orders', AdminOrderViewSet, basename='admin-orders')
# router.register('orders', CustomerOrderViewSet, basename='customer-orders')

# # app's url config
# urlpatterns = [
    
#     path('', include(router.urls)),
    

#     #cause lower are generics wala
#     path('browse/categories/', PublicCategoryList.as_view()),
#     path('browse/products/', ActiveProductList.as_view()),
# ]





# # shop/urls.py
# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import (
#     CategoryViewSet, ProductViewSet,
#     CustomerOrderViewSet, AdminOrderViewSet,
#     PublicCategoryList, ActiveProductList,
# )

# router = DefaultRouter()
# # ---------------- Admin endpoints ----------------
# router.register(r'admin/categories', CategoryViewSet, basename='admin-category')
# router.register(r'admin/products',  ProductViewSet,   basename='admin-product')
# router.register(r'admin/orders',    AdminOrderViewSet, basename='admin-order')

# # ---------------- Customer endpoints -------------
# router.register(r'orders', CustomerOrderViewSet, basename='customer-order')

# urlpatterns = [
#     # all ViewSet routes (list, retrieve, create, etc.)
#     path('', include(router.urls)),

#     # public read‑only catalogue
#     path('browse/categories/', PublicCategoryList.as_view(), name='public-category-list'),
#     path('browse/products/',   ActiveProductList.as_view(), name='public-product-list'),
# ]


# shop/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, ProductViewSet, 
    CustomerOrderViewSet, AdminOrderViewSet,
    PublicCategoryList, ActiveProductList
)
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)


# DRF Router for ViewSets
router = DefaultRouter()

# Admin routes (require is_staff or custom permissions)
router.register(r'admin/categories', CategoryViewSet, basename='admin-categories')
router.register(r'admin/products', ProductViewSet, basename='admin-products')
router.register(r'admin/orders', AdminOrderViewSet, basename='admin-orders')

# Customer routes (require user auth)
router.register(r'orders', CustomerOrderViewSet, basename='customer-orders')

# App URL config
urlpatterns = [
    # All DRF ViewSet routes
    path('', include(router.urls)),

    # Public read-only routes using generic views
    path('browse/categories/', PublicCategoryList.as_view(), name='public-categories'),
    path('browse/products/', ActiveProductList.as_view(), name='public-products'),


    # OpenAPI schema JSON
    path('schema/', SpectacularAPIView.as_view(), name='schema'),

    # Swagger UI:
    path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # Optional: Redoc UI
    path('redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
