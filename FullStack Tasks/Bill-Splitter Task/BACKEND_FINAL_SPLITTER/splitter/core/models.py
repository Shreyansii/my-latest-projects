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
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    group = models.ForeignKey('groups.Group', on_delete=models.CASCADE, null=True, blank=True)
    type = models.CharField(max_length=50)
    ref_table = models.CharField(max_length=50)
    ref_id = models.PositiveIntegerField()
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    
    class Meta:
        ordering = ['-created_at']