import json
from django.utils.deprecation import MiddlewareMixin
from .utils import log_activity

class ActivityLogMiddleware(MiddlewareMixin):
    """
    Middleware to automatically log user activities.
    """
    def process_response(self, request, response):
        if (hasattr(request, 'user') and 
            request.user.is_authenticated and 
            request.method in ['POST', 'PUT', 'PATCH', 'DELETE'] and
            response.status_code < 400):
            
            path = request.path
            method = request.method
            
            # Log based on URL patterns
            if '/api/expenses/' in path and method == 'POST':
                log_activity(
                    user=request.user,
                    action_type='expense_created',
                    ref_table='expenses',
                    ref_id=0,  # need to extract from response
                    description=f'User created a new expense'
                )
            elif '/api/groups/' in path and method == 'POST':
                log_activity(
                    user=request.user,
                    action_type='group_created',
                    ref_table='groups',
                    ref_id=0,
                    description=f'User created a new group'
                )
        
        return response