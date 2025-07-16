from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        # Safe methods: GET, HEAD, OPTIONS
        if request.method in SAFE_METHODS:
            return True
        # Allow only admins to POST, PUT, DELETE
        return request.user and request.user.is_staff
