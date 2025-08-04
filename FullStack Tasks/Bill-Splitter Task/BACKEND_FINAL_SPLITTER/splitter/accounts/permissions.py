from rest_framework import permissions

class IsVerifiedUser(permissions.BasePermission):
    """
    Custom permission to only allow verified users to access certain views.
    """
    message = "You must verify your email address to access this resource."
    
    def has_permission(self, request, view):
        # Check if user is authenticated and verified
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
        # Read permissions for any request (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for owner
        return obj.user == request.user

class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to access it.
    """
    def has_object_permission(self, request, view, obj):
        # Only owner can access
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
            # Admin users can access anything
            if request.user.is_staff or request.user.is_superuser:
                return True
            # Regular users must be verified
            return request.user.is_verified
        return False