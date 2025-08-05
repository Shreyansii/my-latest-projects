# from django.db import models
# from accounts.models import User
# from groups.models import Group
# from core.models import Category

# class Expense(models.Model):
#     group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='expenses')
#     user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_expenses')  # creator
#     byUser = models.ForeignKey(User, on_delete=models.CASCADE, related_name='paid_expenses')   # payer
#     forUser = models.ForeignKey(User, on_delete=models.CASCADE, related_name='target_expenses', null=True, blank=True)
#     amount = models.DecimalField(max_digits=10, decimal_places=2)
#     isActive = models.BooleanField(default=True)
#     category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
#     note = models.CharField(max_length=255, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"{self.amount} by {self.byUser.username} in {self.group.name}"

#     class Meta:
#         ordering = ['-created_at']

# class ExpenseHistory(models.Model):
#     CHANGE_TYPE_CHOICES = [
#         ('created', 'Created'),
#         ('updated', 'Updated'),
#         ('deleted', 'Deleted'),
#         ('restored', 'Restored'),
#     ]

#     expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name='history')
#     changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
#     change_type = models.CharField(max_length=50, choices=CHANGE_TYPE_CHOICES)
#     old_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
#     new_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
#     old_note = models.TextField(blank=True, null=True)
#     new_note = models.TextField(blank=True, null=True)
#     old_status = models.CharField(max_length=20, blank=True, null=True)
#     new_status = models.CharField(max_length=20, blank=True, null=True)
#     changed_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"{self.change_type} on {self.expense} by {self.changed_by}"

#     class Meta:
#         verbose_name_plural = "Expense histories"
#         ordering = ['-changed_at']