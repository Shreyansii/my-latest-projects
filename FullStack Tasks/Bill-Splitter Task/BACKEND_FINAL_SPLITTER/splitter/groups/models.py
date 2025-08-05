# from django.db import models
# from accounts.models import User

# class Group(models.Model):
#     name = models.CharField(max_length=100)
#     description = models.TextField(blank=True)
#     group_avatar_url = models.URLField(blank=True)
#     currency = models.CharField(max_length=10, default='USD')
#     isActive = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return self.name

#     class Meta:
#         ordering = ['-created_at']

# class GroupUser(models.Model):
#     group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='members')
#     user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='group_memberships')
#     isActive = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"{self.user.username} in {self.group.name}"

#     class Meta:
#         unique_together = ['group', 'user']
#         ordering = ['-created_at']

# class Invite(models.Model):
#     STATUS_CHOICES = [
#         ('pending', 'Pending'),
#         ('accepted', 'Accepted'),
#         ('declined', 'Declined'),
#         ('expired', 'Expired'),
#     ]
    
#     email = models.EmailField()
#     invited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="sent_invites")
#     group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='invites')
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
#     token = models.CharField(max_length=255, unique=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"Invite to {self.group.name} for {self.email}"

#     class Meta:
#         ordering = ['-created_at']

# from django.db import models
# from django.conf import settings
# import uuid

# class Group(models.Model):
#     name = models.CharField(max_length=255)
#     description = models.TextField(blank=True)
#     group_avatar_url = models.URLField(blank=True)
#     currency = models.CharField(max_length=10, default='USD')
#     is_active = models.BooleanField(default=True)
#     created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_groups')
#     members = models.ManyToManyField(settings.AUTH_USER_MODEL, through='GroupUser', related_name='custom_groups')
#     created_at = models.DateTimeField(auto_now_add=True)
    
#     def __str__(self):
#         return self.name
    
#     @property
#     def member_count(self):
#         return self.members.count()

# class GroupUser(models.Model):
#     group = models.ForeignKey(Group, on_delete=models.CASCADE)
#     user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
#     is_active = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True)
    
#     class Meta:
#         unique_together = ('group', 'user')

# class Invite(models.Model):
#     STATUS_CHOICES = [
#         ('pending', 'Pending'),
#         ('accepted', 'Accepted'),
#         ('rejected', 'Rejected'),
#         ('expired', 'Expired'),
#     ]
    
#     email = models.EmailField()
#     invited_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_invites')
#     group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='invites')
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
#     token = models.UUIDField(default=uuid.uuid4, unique=True)
#     created_at = models.DateTimeField(auto_now_add=True)
    
#     class Meta:
#         unique_together = ('email', 'group')


from django.db import models
from django.conf import settings
import uuid

class Group(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    group_avatar_url = models.URLField(blank=True)
    currency = models.CharField(max_length=10, default='USD')
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='created_groups',
        default=1  #default value
    )
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, through='GroupUser', related_name='custom_groups')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    @property
    def member_count(self):
        return self.members.count()

class GroupUser(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('group', 'user')

class Invite(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
    ]
    
    email = models.EmailField()
    invited_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_invites')
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='invites')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('email', 'group')