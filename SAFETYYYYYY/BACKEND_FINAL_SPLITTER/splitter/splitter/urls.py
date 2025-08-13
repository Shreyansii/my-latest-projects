# splitter/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from rest_framework import status
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.response import Response
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

# The following class is correctly implemented to handle token refresh via cookies
class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')
        
        if not refresh_token:
            return Response({'error': 'Refresh token not found'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
            
            response = Response({'message': 'Token refreshed successfully'})
            
            response.set_cookie(
                'access_token',
                access_token,
                max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
                httponly=True,
                secure=getattr(settings, 'SECURE_COOKIES', False),
                samesite='Lax',
            )
            
            return response
            
        except (InvalidToken, TokenError):
            return Response({'error': 'Invalid or expired refresh token'}, status=status.HTTP_401_UNAUTHORIZED)

# Assuming you have a router configured for expenses that handles /expenses/
from expenses.urls import router as expenses_router

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Correctly include all API app URLs under the /api/ prefix
    path('api/auth/', include('accounts.urls')),
    path('api/', include('groups.urls')),
    path('api/', include(expenses_router.urls)),
    path('api/', include('settlements.urls')),
    path('api/', include('notifications.urls')),
    path('api/', include('core.urls')),
    
    # Authentication endpoints
    path('api/auth/token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # Swagger/Spectacular documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui')
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)