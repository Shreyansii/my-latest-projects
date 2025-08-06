
from .models import ActivityLog
from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist



def generate_activity_description(user, action_type, ref_table, ref_obj):
    user_name = user.get_full_name() or user.username
    if action_type == 'DELETE':
        return f"{user_name} deleted {ref_table} '{ref_obj}'"
    elif action_type == 'ADD_EXPENSE':
        return f"{user_name} added an expense '{ref_obj}'"
    elif action_type == 'EDIT':
        return f"{user_name} edited {ref_table} '{ref_obj}'"
    elif action_type == 'SETTLE':
        return f"{user_name} settled up in {ref_table} '{ref_obj}'"
    else:
        return f"{user_name} performed {action_type} on {ref_table} '{ref_obj}'"



def log_activity(user, group, action_type, ref_table, ref_obj, ref_id=None):
    description = generate_activity_description(user, action_type, ref_table, ref_obj)
    
    return ActivityLog.objects.create(
        user=user,
        group=group,
        type=action_type,
        ref_table=ref_table,
        ref_id=ref_id or getattr(ref_obj, 'id', None),
        description=description
    )
