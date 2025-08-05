from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'settings', views.SettingsViewSet, basename='settings')

urlpatterns = [
    path('', include(router.urls)),
    # path('settings/', views.SettingsView.as_view(), name='settings'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]


# (NOTE) automatically created endpoints :

# POST /api/users/create/ - Register user
# POST /api/users/login/ - Login user
# POST /api/users/logout/ - Logout user
# GET/PUT/PATCH /api/users/me/ - User profile
# POST /api/users/change_password/ - Change password (authenticated)
# POST /api/users/verify_email/ - Verify email
# POST /api/users/resend_verification/ - Resend verification email
# POST /api/users/forgot_password/ - Send password reset email (NEW)
# POST /api/users/reset_password/ - Reset password with token (NEW)