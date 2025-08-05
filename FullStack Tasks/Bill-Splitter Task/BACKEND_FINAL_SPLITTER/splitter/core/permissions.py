from rest_framework import permissions

class IsGroupMember(permissions.BasePermission):
    """
    Custom permission to only allow members of a group to access it.
    """
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'group'):
            return obj.group.members.filter(id=request.user.id).exists()
        elif hasattr(obj, 'members'):
            return obj.members.filter(id=request.user.id).exists()
        return False

class IsExpenseParticipant(permissions.BasePermission):
    """
    Custom permission for expense-related operations.
    """
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'expense'):
            expense = obj.expense
        else:
            expense = obj
        
        return (expense.group.members.filter(id=request.user.id).exists() or
                expense.by_user == request.user)

class IsGroupAdmin(permissions.BasePermission):
    """
    Custom permission for group admin operations.
    """
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'group'):
            group = obj.group
        else:
            group = obj
        
        # Check if user is group admin (assuming creator is admin)
        return group.created_by == request.user