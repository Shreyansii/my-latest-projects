from rest_framework import generics, permissions
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models

from .models import Category, ActivityLog
from .serializers import CategorySerializer, ActivityLogSerializer
from .permissions import IsGroupMember


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class ActivityLogListView(generics.ListAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsGroupMember]  #Permissions require the user to be authenticated and a member of the related group
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group', 'type']

    def get_queryset(self):
        return ActivityLog.objects.filter(
            models.Q(user=self.request.user) |
            models.Q(group__members=self.request.user)
        ).distinct().order_by('-created_at')