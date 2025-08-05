from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, ActivityLog
from .serializers import CategorySerializer, ActivityLogSerializer
from rest_framework import (
    generics,
    permissions,
)

from django.db import models




class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class ActivityLogListView(generics.ListAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group', 'type']
    
    def get_queryset(self):
        return ActivityLog.objects.filter(
            models.Q(user=self.request.user) |
            models.Q(group__members=self.request.user)
        ).distinct().order_by('-created_at')