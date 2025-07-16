# ecommerce_api/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [
    path('admin/', admin.site.urls),          # HTML Django admin
    path('api/',   include('shop.urls')),     # every DRF route lives under /api/



    # JWT token endpoints:
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),       # to get access and refresh tokens
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),      # to refresh access token
]


