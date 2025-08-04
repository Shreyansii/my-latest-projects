from django.db import models
from accounts.models import User
from groups.models import Group

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('expense_added', 'Expense Added'),
        ('expense_edited', 'Expense Edited'),
        ('settlement_made', 'Settlement Made'),
        ('group_invite', 'Group Invite'),
        ('user_joined', 'User Joined'),
        ('user_left', 'User Left'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    group = models.ForeignKey(Group, on_delete=models.SET_NULL, null=True, blank=True)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.type}"

    class Meta:
        ordering = ['-created_at']

class ActivityLog(models.Model):
    ACTIVITY_TYPES = [
        ('expense_created', 'Expense Created'),
        ('expense_updated', 'Expense Updated'),
        ('expense_deleted', 'Expense Deleted'),
        ('settlement_made', 'Settlement Made'),
        ('user_joined', 'User Joined Group'),
        ('user_left', 'User Left Group'),
        ('group_created', 'Group Created'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    group = models.ForeignKey(Group, on_delete=models.SET_NULL, null=True)
    type = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    refTable = models.CharField(max_length=50)  # Model name that was affected
    refId = models.IntegerField()  # ID of the affected record
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} by {self.user.username if self.user else 'System'}"

    class Meta:
        ordering = ['-created_at']