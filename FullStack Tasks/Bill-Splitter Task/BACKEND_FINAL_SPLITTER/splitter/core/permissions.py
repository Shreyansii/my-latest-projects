from rest_framework import permissions

class IsGroupMember(permissions.BasePermission):
    """
    Allow access only if user is a member of the group.
    """
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'group'):
            return obj.group.members.filter(id=request.user.id).exists()
        elif hasattr(obj, 'members'):
            return obj.members.filter(id=request.user.id).exists()
        return False

class IsGroupAdmin(permissions.BasePermission):
    """
    Allow access only if user is the group admin.
    
    """
    def has_object_permission(self, request, view, obj):
        group = None
        if hasattr(obj, 'group'):
            group = obj.group
        elif hasattr(obj, 'members'):
            group = obj

        if group and hasattr(group, 'created_by'):
            return group.created_by == request.user
        
        return False
    


    ###remove laterr

class IsExpenseParticipant(permissions.BasePermission):
    """
    Allow access only if the user is a participant in the expense.
    """
    def has_object_permission(self, request, view, obj):
        # Assuming obj is an Expense instance and has a participants relationship
        if hasattr(obj, 'participants'):
            return obj.participants.filter(id=request.user.id).exists()
        return False
