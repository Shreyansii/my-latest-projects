from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import uuid


# -------------------------
# GROUP & GROUPUSER MODELS
# -------------------------

class Group(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    group_avatar_url = models.URLField(blank=True)
    currency = models.CharField(max_length=10, default='NPR')
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_groups'
    )
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='GroupUser',
        related_name='custom_groups'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    @property
    def member_count(self):
        return self.members.count()


class GroupUser(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)  # Tracks if member is currently active
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('group', 'user')  # Prevents duplicate memberships


# -------------------------
# INVITE MODEL
# -------------------------

def default_expiry():
    """Default invite expiry is 7 days from now."""
    return timezone.now() + timedelta(days=7)


class Invite(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired')
    ]

    email = models.EmailField()  # of invitee
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_invites'
    )
    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name='invites'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    expires_at = models.DateTimeField(default=default_expiry)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['email', 'group'],
                condition=models.Q(status='pending'),
                name='unique_pending_invite_per_group'
            )
        ]

    def is_expired(self):
        """Check if the invite's time is past expiry."""
        return timezone.now() > self.expires_at

    def save(self, *args, **kwargs):
        """Auto-update status to 'expired' if past expiry date."""
        if self.status == 'pending' and self.is_expired():
            self.status = 'expired'
        super().save(*args, **kwargs)
