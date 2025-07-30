
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, ProductViewSet, 
    CustomerOrderViewSet, AdminOrderViewSet,
    PublicCategoryList, ActiveProductList, RegisterView,DashboardSummaryView,CustomTokenObtainPairView,UserDetailView,AdminUserViewSet
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

# #for customer order

router.register(r'customer/orders', CustomerOrderViewSet, basename='customer-orders')
router.register(r'admin/users', AdminUserViewSet, basename='admin-users')


# App URL config
urlpatterns = [
    # All DRF ViewSet routes
    path('', include(router.urls)),

    # Public read-only routes using generic views
    path('browse/categories/', PublicCategoryList.as_view(), name='public-categories'),
    path('browse/products/', ActiveProductList.as_view(), name='public-products'),


    # added

    path('user/', UserDetailView.as_view(), name='user-detail'),

        # User registration route
    path('register/', RegisterView.as_view(), name='user-register'),


      # --- NEW: Dashboard Summary URL ---
    path('dashboard/summary/', DashboardSummaryView.as_view(), name='dashboard-summary'), 



    # OpenAPI schema JSON
    path('schema/', SpectacularAPIView.as_view(), name='schema'),

    # Swagger UI:
    path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # Optional: Redoc UI
    path('redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
