# revisit after expense app completion

# class ExpenseLoggingMiddleware:
#     def __init__(self, get_response):
#         self.get_response = get_response

#     def __call__(self, request):
#         response = self.get_response(request)

#         if request.user.is_authenticated and '/api/expenses/' in request.path:
#             print(f"User {request.user} called Expenses API.")

#         return response
