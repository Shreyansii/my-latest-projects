from rest_framework import permissions, exceptions
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken


class IsVerifiedUser(permissions.BasePermission):
    """
    Custom permission to only allow verified users to access certain views.
    """
    message = "You must verify your email address to access this resource."
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_verified
        )


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    Others can only read.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user


class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to access it.
    """
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IsVerifiedOwner(permissions.BasePermission):
    """
    Combination: User must be verified AND own the object
    """
    message = "You must verify your email and own this resource to access it."
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_verified
        )
    
    def has_object_permission(self, request, view, obj):
        return (
            request.user.is_verified and 
            obj.user == request.user
        )


class IsAdminOrVerifiedUser(permissions.BasePermission):
    """
    Allow access to admin users or verified regular users
    """
    def has_permission(self, request, view):
        if request.user and request.user.is_authenticated:
            if request.user.is_staff or request.user.is_superuser:
                return True
            return request.user.is_verified
        return False


class JWTCookieAuthentication(JWTAuthentication):
    """
    Custom JWT Authentication class that reads access token from HttpOnly cookies.
    """

    def get_auth_token_classes(self):
        # Return the token classes this authentication supports validating
        return (AccessToken,)

    def authenticate(self, request):
        # Look for token in cookies instead of Authorization header
        raw_token = request.COOKIES.get('access_token')
        if not raw_token:
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
        except TokenError:
            raise exceptions.AuthenticationFailed('Invalid or expired token')

        return self.get_user(validated_token), validated_token
