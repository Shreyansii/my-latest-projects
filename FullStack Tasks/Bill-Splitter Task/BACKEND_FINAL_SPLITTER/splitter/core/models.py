from django.db import models
from django.conf import settings

class Category(models.Model):
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class ActivityLog(models.Model):
    ACTION_TYPE_CHOICES = [
        ('group_creation', 'Group Creation'),
        ('group_deletion', 'Group Deletion'),
        ('expense_creation', 'Expense Creation'),
        ('expense_update', 'Expense Update'),
        ('settlement', 'Settlement'),
        ('member_joined', 'Member Joined'),
        ('member_removal', 'Member Removal'),
        ('invite_sent', 'Invite Sent'),
        ('invite_accepted', 'Invite Accepted'),
        
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    group = models.ForeignKey(
        'groups.Group',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    type = models.CharField(
        max_length=50,
        choices=ACTION_TYPE_CHOICES,
        help_text="The type of activity logged"
    )
    ref_table = models.CharField(max_length=50)
    ref_id = models.PositiveIntegerField(null=True, blank=True)  # Made nullable in case no ref_id
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        if self.user:
            return f"{self.user.get_full_name() or self.user.username} did {self.get_type_display()}"
        return f"Unknown did {self.get_type_display()}"
