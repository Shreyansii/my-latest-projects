from rest_framework import status, permissions, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action, throttle_classes
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.utils import timezone
from django.utils.crypto import get_random_string
from datetime import timedelta
from django.conf import settings
from django.db import transaction

from .throttles import ForgotPasswordThrottle, ResendVerificationThrottle
from .models import User, Settings, EmailVerificationToken
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserLoginSerializer,
    ChangePasswordSerializer,
    ResetPasswordSerializer,
    ForgotPasswordSerializer,
    SettingsSerializer,
)
from .permissions import IsVerifiedUser
from rest_framework.permissions import IsAuthenticated


class SettingsViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SettingsSerializer

    def get_queryset(self):
        return Settings.objects.filter(user=self.request.user)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ['create', 'login', 'verify_email', 'forgot_password', 'reset_password']:
            return [permissions.AllowAny()]
        elif self.action in ['me', 'resend_verification', 'change_password', 'logout']:
            return [permissions.IsAuthenticated(), IsVerifiedUser()]
        elif self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegistrationSerializer
        elif self.action == 'login':
            return UserLoginSerializer
        elif self.action == 'change_password':
            return ChangePasswordSerializer
        elif self.action == 'reset_password':
            return ResetPasswordSerializer
        elif self.action == 'forgot_password':
            return ForgotPasswordSerializer
        return UserSerializer

    def _set_auth_cookies(self, response, user):
        refresh = RefreshToken.for_user(user)

        # Fix cookie settings here for dev and prod environments
        # Use samesite='Lax' for dev http or 'None' + secure=True for prod https
        samesite = 'Lax'  # Change to 'None' if cross-site with HTTPS
        secure = getattr(settings, 'SECURE_COOKIES', False)  # False in dev

        domain = getattr(settings, 'COOKIE_DOMAIN', None)  # Set domain if needed

        # Set HttpOnly cookies for tokens
        response.set_cookie(
            'access_token',
            str(refresh.access_token),
            max_age=int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()),
            httponly=True,
            secure=secure,
            samesite=samesite,
            domain=domain,
            path='/',
        )
        response.set_cookie(
            'refresh_token',
            str(refresh),
            max_age=int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()),
            httponly=True,
            secure=secure,
            samesite=samesite,
            domain=domain,
            path='/',
        )
        # Set non-HttpOnly cookie for frontend/middleware
        response.set_cookie(
            'is_authenticated',
            'true',
            max_age=int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()),
            httponly=False,  # Important: frontend can read this cookie
            secure=secure,
            samesite=samesite,
            domain=domain,
            path='/',
        )
        return response

    def _clear_auth_cookies(self, response):
        domain = getattr(settings, 'COOKIE_DOMAIN', None)
        response.delete_cookie('access_token', domain=domain, path='/')
        response.delete_cookie('refresh_token', domain=domain, path='/')
        response.delete_cookie('is_authenticated', domain=domain, path='/')  # Also clear this cookie
        return response

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                user = serializer.save()
                token_obj = EmailVerificationToken.objects.create(user=user)
                self.send_verification_email(user, token_obj.token)
                return Response({
                    'user': UserSerializer(user).data,
                    'message': 'Account created successfully! Please check your email to verify your account.'
                }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def send_verification_email(self, user, token):
        # verification_link = f"http://localhost:3000/verify-email/{token}"
        verification_link = f"{settings.FRONTEND_URL}/verify-email/{token}"
        send_mail(
            subject='Verify your email - Splitter App',
            message=(
                f'Hi {user.first_name or user.username},\n\n'
                f'Thank you for signing up for Splitter!\n'
                f'Please click the link below to verify your email address:\n\n'
                f'{verification_link}\n\n'
                f'This link will expire in 24 hours.\n\n'
                f'If you didn\'t create this account, please ignore this email.\n\n'
                f'Best regards,\nThe Splitter Team'
            ),
            from_email='noreply@splitter.com',
            recipient_list=[user.email],
        )

    def send_password_reset_email(self, user, token):
        reset_link = f"http://localhost:3000/reset-password/{token}"
        send_mail(
            subject='Reset your password - Splitter App',
            message=(
                f'Hi {user.first_name or user.username},\n\n'
                f'You have requested to reset your password.\n'
                f'Click the link below to reset it:\n\n'
                f'{reset_link}\n\n'
                f'This link will expire in 1 hour.\n\n'
                f'If you didn\'t request this, ignore this email.\n\n'
                f'The Splitter Team'
            ),
            from_email='noreply@splitter.com',
            recipient_list=[user.email],
        )

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    @throttle_classes([ForgotPasswordThrottle])
    def forgot_password(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                token = get_random_string(32)
                user.reset_token = token
                user.reset_token_exp = timezone.now() + timedelta(hours=1)
                user.save()
                self.send_password_reset_email(user, token)
            except User.DoesNotExist:
                pass
            return Response({'message': 'Password reset email sent'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def reset_password(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']
            try:
                user = User.objects.get(reset_token=token, reset_token_exp__gt=timezone.now())
                user.set_password(new_password)
                user.reset_token = ''
                user.reset_token_exp = None
                user.save()
                return Response({'message': 'Password reset successful'})
            except User.DoesNotExist:
                return Response({'error': 'Invalid or expired token'}, status=400)
        return Response(serializer.errors, status=400)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['current_password']):
                return Response({'error': 'Current password is incorrect'}, status=400)
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Password changed successfully'})
        return Response(serializer.errors, status=400)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def login(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            if not user.is_verified:
                return Response({
                    'error': 'Please verify your email before logging in.',
                    'code': 'EMAIL_NOT_VERIFIED'
                }, status=400)

            response = Response({
                'user': UserSerializer(user).data,
                'message': 'Login successful'
            })
            response = self._set_auth_cookies(response, user)
            return response
        return Response(serializer.errors, status=400)

    @action(detail=False, methods=['post'])
    def logout(self, request):
        response = Response({'message': 'Successfully logged out'})

        # Clear cookies properly (path and domain important)
        response = self._clear_auth_cookies(response)

        refresh_token = request.COOKIES.get('refresh_token')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass

        return response

    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        if request.method == 'GET':
            serializer = UserSerializer(request.user)
            return Response(serializer.data)
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny], authentication_classes=[] )
    def verify_email(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token is required'}, status=400)

        try:
            verification = EmailVerificationToken.objects.get(token=token)
        except EmailVerificationToken.DoesNotExist:
            return Response({'error': 'Invalid or expired link'}, status=400)

        if timezone.now() > verification.created_at + timedelta(hours=24000):
            verification.delete()  # Optional: clean up expired tokens
            return Response({'error': 'Link expired'}, status=400)

        verification.user.is_verified = True
        verification.user.save()
        verification.delete()

        return Response({'message': 'Email verified successfully'})

# from rest_framework import status, permissions, viewsets
# from rest_framework.response import Response
# from rest_framework.decorators import action, throttle_classes
# from rest_framework_simplejwt.tokens import RefreshToken
# from django.core.mail import send_mail
# from django.utils import timezone
# from django.utils.crypto import get_random_string
# from datetime import timedelta
# from .throttles import ForgotPasswordThrottle, ResendVerificationThrottle

# from .models import User, Settings
# from .serializers import *
# from .permissions import (
#     IsVerifiedUser,
#     IsOwner,
#     IsOwnerOrReadOnly,
#     IsVerifiedOwner,
#     IsAdminOrVerifiedUser
# )
# from rest_framework.permissions import IsAuthenticated
# from django.db import transaction


# class UserViewSet(viewsets.ModelViewSet):
#     """
#     Handles registration, login, profile, email verification,
#     password reset/change, and admin operations.
#     """
#     queryset = User.objects.all()
#     serializer_class = UserSerializer

#     def get_permissions(self):
#         if self.action in ['create', 'login', 'verify_email', 'forgot_password', 'reset_password']:
#             return [permissions.AllowAny()]
#         elif self.action in ['me', 'resend_verification', 'change_password', 'logout']:
#             return [permissions.IsAuthenticated(), IsVerifiedUser()]
#         elif self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
#             return [permissions.IsAdminUser()]
#         return [permissions.IsAuthenticated()]

#     def get_serializer_class(self):
#         if self.action == 'create':
#             return UserRegistrationSerializer
#         elif self.action == 'login':
#             return UserLoginSerializer
#         elif self.action == 'change_password':
#             return ChangePasswordSerializer
#         elif self.action == 'reset_password':
#             return ResetPasswordSerializer
#         elif self.action == 'forgot_password':
#             return ForgotPasswordSerializer
#         return UserSerializer
    
#     # create-register
#     def create(self, request, *args, **kwargs):
#         serializer = self.get_serializer(data=request.data)
#         if serializer.is_valid():
#             with transaction.atomic():
#                 user = serializer.save()
#                 verification_token = get_random_string(32)
#                 user.reset_token = verification_token
#                 user.reset_token_exp = timezone.now() + timedelta(hours=24)
#                 user.save()
#                 self.send_verification_email(user, verification_token)
#                 return Response({
#                     'user': UserSerializer(user).data,
#                     'message': 'Account created successfully! Please check your email to verify your account.'
#                 }, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def send_verification_email(self, user, token):
#         verification_link = f"http://localhost:3000/verify-email/{token}"
#         send_mail(
#             subject='Verify your email - Splitter App',
#             message=(
#                 f'Hi {user.first_name or user.username},\n\n'
#                 f'Thank you for signing up for Splitter!\n'
#                 f'Please click the link below to verify your email address:\n\n'
#                 f'{verification_link}\n\n'
#                 f'This link will expire in 24 hours.\n\n'
#                 f'If you didn\'t create this account, please ignore this email.\n\n'
#                 f'Best regards,\nThe Splitter Team'
#             ),
#             from_email='noreply@splitter.com',
#             recipient_list=[user.email],
#         )

#     def send_password_reset_email(self, user, token):
#         reset_link = f"http://localhost:3000/reset-password/{token}"
#         send_mail(
#             subject='Reset your password - Splitter App',
#             message=(
#                 f'Hi {user.first_name or user.username},\n\n'
#                 f'You have requested to reset your password.\n'
#                 f'Click the link below to reset it:\n\n'
#                 f'{reset_link}\n\n'
#                 f'This link will expire in 1 hour.\n\n'
#                 f'If you didn’t request this, ignore this email.\n\n'
#                 f'The Splitter Team'
#             ),
#             from_email='noreply@splitter.com',
#             recipient_list=[user.email],
#         )

#     @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
#     @throttle_classes([ForgotPasswordThrottle])
#     def forgot_password(self, request):
#         serializer = ForgotPasswordSerializer(data=request.data)
#         if serializer.is_valid():
#             email = serializer.validated_data['email']
#             try:
#                 user = User.objects.get(email=email)
#                 token = get_random_string(32)
#                 user.reset_token = token
#                 user.reset_token_exp = timezone.now() + timedelta(hours=1)
#                 user.save()
#                 self.send_password_reset_email(user, token)
#             except User.DoesNotExist:
#                 pass  # Avoid leaking info
#             return Response({'message': 'Password reset email sent'})
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
#     def reset_password(self, request):
#         serializer = ResetPasswordSerializer(data=request.data)
#         if serializer.is_valid():
#             token = serializer.validated_data['token']
#             new_password = serializer.validated_data['new_password']
#             try:
#                 user = User.objects.get(reset_token=token, reset_token_exp__gt=timezone.now())
#                 user.set_password(new_password)
#                 user.reset_token = ''
#                 user.reset_token_exp = None
#                 user.save()
#                 return Response({'message': 'Password reset successful'})
#             except User.DoesNotExist:
#                 return Response({'error': 'Invalid or expired token'}, status=400)
#         return Response(serializer.errors, status=400)

#     @action(detail=False, methods=['post'])
#     def change_password(self, request):
#         serializer = self.get_serializer(data=request.data)
#         if serializer.is_valid():
#             user = request.user
#             if not user.check_password(serializer.validated_data['current_password']):
#                 return Response({'error': 'Current password is incorrect'}, status=400)
#             user.set_password(serializer.validated_data['new_password'])
#             user.save()
#             return Response({'message': 'Password changed successfully'})
#         return Response(serializer.errors, status=400)

#     @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
#     def login(self, request):
#         serializer = self.get_serializer(data=request.data)
#         if serializer.is_valid():
#             user = serializer.validated_data['user']
#             if not user.is_verified:
#                 return Response({
#                     'error': 'Please verify your email before logging in.',
#                     'code': 'EMAIL_NOT_VERIFIED'
#                 }, status=400)

#             refresh = RefreshToken.for_user(user)
#             return Response({
#                 'refresh': str(refresh),
#                 'access': str(refresh.access_token),
#                 'user': UserSerializer(user).data,
#                 'message': 'Login successful'
#             })
#         return Response(serializer.errors, status=400)

#     @action(detail=False, methods=['post'])
#     def logout(self, request):
#         try:
#             refresh_token = request.data["refresh"]
#             token = RefreshToken(refresh_token)
#             token.blacklist()
#             return Response({'message': 'Successfully logged out'})
#         except Exception:
#             return Response({'error': 'Invalid token'}, status=400)

#     @action(detail=False, methods=['get', 'put', 'patch'])
#     # userprofile
#     def me(self, request):
#         if request.method == 'GET':
#             serializer = UserSerializer(request.user)
#             return Response(serializer.data)
#         else:
#             serializer = UserSerializer(request.user, data=request.data, partial=True)
#             if serializer.is_valid():
#                 serializer.save()
#                 return Response(serializer.data)
#             return Response(serializer.errors, status=400)

#     @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
#     def verify_email(self, request):
#         token = request.data.get('token')
#         try:
#             user = User.objects.get(reset_token=token, reset_token_exp__gt=timezone.now())
#             user.is_verified = True
#             user.reset_token = ''
#             user.reset_token_exp = None
#             user.save()
#             return Response({'message': 'Email verified successfully! You can now login.', 'verified': True})
#         except User.DoesNotExist:
#             return Response({'error': 'Invalid or expired verification token'}, status=400)

#     @action(detail=False, methods=['post'])
#     @throttle_classes([ResendVerificationThrottle])
#     def resend_verification(self, request):
#         user = request.user
#         if user.is_verified:
#             return Response({'message': 'Email already verified'})
#         verification_token = get_random_string(32)
#         user.reset_token = verification_token
#         user.reset_token_exp = timezone.now() + timedelta(hours=24)
#         user.save()
#         self.send_verification_email(user, verification_token)
#         return Response({'message': 'Verification email sent successfully! Check your inbox.'})


# class SettingsViewSet(viewsets.ModelViewSet):
#     permission_classes = [IsAuthenticated]
#     serializer_class = SettingsSerializer

#     # UPDATED: Fix swagger/anonymous user error by returning empty queryset if anonymous or swagger_fake_view
#     def get_queryset(self):
#         if getattr(self, "swagger_fake_view", False) or self.request.user.is_anonymous:
#             return Settings.objects.none()
#         return Settings.objects.filter(user=self.request.user)

#     @action(detail=False, methods=['post'])
#     def deactivate_account(self, request):
#         user = request.user
#         password = request.data.get('password')
#         if not password or not user.check_password(password):
#             return Response({'detail': 'Invalid password'}, status=400)
#         user.is_active = False
#         user.save()
#         return Response({'detail': 'Account deactivated successfully'}, status=200)

#     @action(detail=False, methods=['post'])
#     def reactivate_account(self, request):
#         user = request.user
#         password = request.data.get('password')
#         if not password or not user.check_password(password):
#             return Response({'detail': 'Invalid password'}, status=400)
#         user.is_active = True
#         user.save()
#         return Response({'detail': 'Account reactivated successfully'}, status=200)


