from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    avatar_url = models.URLField(blank=True)
    is_verified = models.BooleanField(default=False)
    reset_token = models.CharField(max_length=255, blank=True)
    reset_token_exp = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)  # Remove default=timezone.now
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

class Settings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='settings')
    dark_mode = models.BooleanField(default=False)
    notify_on_add = models.BooleanField(default=True)
    notify_on_edit = models.BooleanField(default=True)
    notify_on_settle = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)  # Remove default=timezone.now
    updated_at = models.DateTimeField(auto_now=True)