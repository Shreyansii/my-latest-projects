from rest_framework import status, generics, permissions, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.contrib.auth import authenticate
from django.utils import timezone
from django.utils.crypto import get_random_string
from datetime import timedelta

from .models import User, Settings
from .serializers import *
from .permissions import (
    IsVerifiedUser,
    IsOwner,
    IsOwnerOrReadOnly,
    IsVerifiedOwner,
    IsAdminOrVerifiedUser,
)

class UserViewSet(viewsets.ModelViewSet):
    """
    ModelViewSet for User - handles full CRUD + custom auth actions
    Perfect for user management with authentication endpoints
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'login', 'verify_email']:
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
        return UserSerializer

    def create(self, request, *args, **kwargs):
        """Override create to send verification email after user registration"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            verification_token = get_random_string(32)
            user.reset_token = verification_token
            user.reset_token_exp = timezone.now() + timedelta(hours=24)
            user.save()
            
            self.send_verification_email(user, verification_token)
            return Response({
                'user': UserSerializer(user).data,
                'message': 'Account created successfully! Please check your email to verify your account.'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def send_verification_email(self, user, token):
        """Send verification email to user"""
        verification_link = f"http://localhost:3000/verify-email/{token}"
        send_mail(
            'Verify your email - Splitter App',
            f'Hi {user.first_name or user.username},\n\n'
            f'Thank you for signing up for Splitter!\n'
            f'Please click the link below to verify your email address:\n\n'
            f'{verification_link}\n\n'
            f'This link will expire in 24 hours.\n\n'
            f'If you didn\'t create this account, please ignore this email.\n\n'
            f'Best regards,\nThe Splitter Team',
            'noreply@splitter.com',
            [user.email],
        )

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def login(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            if not user.is_verified:
                return Response({
                    'error': 'Please verify your email before logging in.',
                    'code': 'EMAIL_NOT_VERIFIED'
                }, status=status.HTTP_400_BAD_REQUEST)
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data,
                'message': 'Login successful'
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def logout(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Successfully logged out'})
        except Exception:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        if request.method == 'GET':
            serializer = UserSerializer(request.user)
            return Response(serializer.data)
        else:
            serializer = UserSerializer(request.user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['current_password']):
                return Response({'error': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Password changed successfully'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def verify_email(self, request):
        token = request.data.get('token')
        try:
            user = User.objects.get(reset_token=token, reset_token_exp__gt=timezone.now())
            user.is_verified = True
            user.reset_token = ''
            user.reset_token_exp = None
            user.save()
            return Response({'message': 'Email verified successfully! You can now login.', 'verified': True})
        except User.DoesNotExist:
            return Response({'error': 'Invalid or expired verification token'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def resend_verification(self, request):
        user = request.user
        if user.is_verified:
            return Response({'message': 'Email already verified'})
        verification_token = get_random_string(32)
        user.reset_token = verification_token
        user.reset_token_exp = timezone.now() + timedelta(hours=24)
        user.save()
        self.send_verification_email(user, verification_token)
        return Response({'message': 'Verification email sent successfully! Check your inbox.'})


class SettingsView(generics.RetrieveUpdateAPIView):
    """
    Retrieve/Update settings for the authenticated and verified user
    """
    serializer_class = SettingsSerializer
    permission_classes = [permissions.IsAuthenticated, IsVerifiedUser]

    def get_object(self):
        settings, _ = Settings.objects.get_or_create(user=self.request.user)
        return settings
