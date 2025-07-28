from rest_framework.permissions import BasePermission, SAFE_METHODS

# class IsAdminUser(BasePermission):
#     def has_permission(self, request, view):
#         return request.user.is_authenticated and request.user.role == 'admin'


class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True  # Anyone can read
        return request.user.is_authenticated and request.user.role == 'admin'


class IsCustomer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'customer'

class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.role == 'admin' or obj.customer == request.user
