
from .models import ActivityLog
from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist


# ref table and ref obj example
# "Alice added an expense 'Lunch with friends'"
# ref table=expense, ref obj=lunch with friends
 


ACTION_TEMPLATES = {
    'group_creation': "{user} created the group '{ref_obj}'",
    'group_deletion': "{user} deleted the group '{ref_obj}'",
    'expense_creation': "{user} added an expense '{ref_obj}'",
    'expense_update': "{user} updated the expense '{ref_obj}'",
    'settlement': "{user} settled up in {ref_table} '{ref_obj}'",
    'member_joined': "{user} joined the group '{ref_obj}'",
    'member_removal': "{user} removed {ref_obj} from the group '{group_name}'",
    'invite_sent': "{user} invited {ref_obj} to join the group '{group_name}'",
    'invite_accepted': "{user} accepted the invitation to join the group '{ref_obj}'",
}


def generate_activity_description(user, action_type, ref_table, ref_obj, group_name=None):
    user_name = user.get_full_name() or user.username
    template = ACTION_TEMPLATES.get(
        action_type,
        "{user} performed {action} on {ref_table} '{ref_obj}'"  # default fallback
    )
    
    return template.format(
        user=user_name,
        action=action_type,
        ref_table=ref_table,
        ref_obj=ref_obj,
        group_name=group_name or ""
    )



def log_activity(user, group, action_type, ref_table, ref_obj, ref_id=None):  

    group_name = group.name if group else None
    description = generate_activity_description(user, action_type, ref_table, ref_obj, group_name)
    
    return ActivityLog.objects.create(
        user=user,
        group=group,
        type=action_type,
        ref_table=ref_table,
        ref_id=ref_id or getattr(ref_obj, 'id', None),
        description=description
    )







# def generate_activity_description(user, action_type, ref_table, ref_obj):
#     user_name = user.get_full_name() or user.username
#     if action_type == 'DELETE':
#         return f"{user_name} deleted {ref_table} '{ref_obj}'"
#     elif action_type == 'ADD_EXPENSE':
#         return f"{user_name} added an expense '{ref_obj}'"
#     elif action_type == 'EDIT':
#         return f"{user_name} edited {ref_table} '{ref_obj}'"
#     elif action_type == 'SETTLE':
#         return f"{user_name} settled up in {ref_table} '{ref_obj}'"
#     else:
#         return f"{user_name} performed {action_type} on {ref_table} '{ref_obj}'"
