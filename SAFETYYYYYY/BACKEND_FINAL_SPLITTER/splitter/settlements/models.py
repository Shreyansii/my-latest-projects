# from django.db import models
# from accounts.models import User
# from groups.models import Group

# class Settlement(models.Model):
#     PAYMENT_METHODS = [
#         ('cash', 'Cash'),
#         ('bank_transfer', 'Bank Transfer'),
#         ('mobile_payment', 'Mobile Payment'),
#         ('credit_card', 'Credit Card'),
#         ('other', 'Other'),
#     ]

#     group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='settlements')
#     byUser = models.ForeignKey(User, on_delete=models.CASCADE, related_name='settlements_paid')
#     forUser = models.ForeignKey(User, on_delete=models.CASCADE, related_name='settlements_received')
#     amount = models.DecimalField(max_digits=10, decimal_places=2)
#     method = models.CharField(max_length=50, choices=PAYMENT_METHODS, default='cash')
#     note = models.TextField(blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"{self.byUser.username} paid {self.amount} to {self.forUser.username}"

#     class Meta:
#         ordering = ['-created_at']

# class Balance(models.Model):
#     group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='balances')
#     byUser = models.ForeignKey(User, on_delete=models.CASCADE, related_name='balances_by')
#     forUser = models.ForeignKey(User, on_delete=models.CASCADE, related_name='balances_for')
#     amount = models.DecimalField(max_digits=10, decimal_places=2)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"{self.byUser.username} owes {self.amount} to {self.forUser.username}"

#     class Meta:
#         unique_together = ['group', 'byUser', 'forUser']
#         ordering = ['-amount']
