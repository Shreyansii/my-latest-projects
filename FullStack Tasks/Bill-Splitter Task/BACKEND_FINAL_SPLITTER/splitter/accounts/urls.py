from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path('settings/', views.SettingsView.as_view(), name='settings'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]