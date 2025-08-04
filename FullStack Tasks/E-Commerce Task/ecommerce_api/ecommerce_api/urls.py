
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    # TokenObtainPairView,
    TokenRefreshView,
)
from shop.views import CustomTokenObtainPairView 
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),          # HTML Django admin
    path('api/',   include('shop.urls')),     # every DRF route lives under /api/



    # JWT token endpoints:
    # path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),       # to get access and refresh tokens

    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh')     # to refresh access token
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)