from rest_framework import serializers
from .models import Category, ActivityLog
from .utils import generate_activity_description




class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ActivityLogSerializer(serializers.ModelSerializer):
    added_by = serializers.SerializerMethodField()
    group_name = serializers.SerializerMethodField()

    class Meta:
        model = ActivityLog
        fields = [
            'id',
            'added_by',
            'group_name',
            'type',
            'ref_table',
            'ref_id',
            'description',
            'created_at'
        ]

    def get_added_by(self, obj): #obj = here activity log's instance
        if obj.user: #Checks if the ActivityLog instance (obj) has a linked user.
            return obj.user.get_full_name() or obj.user.username
        return "Unknown User"

    def get_group_name(self, obj):
        if obj.group:
            return obj.group.name
        return "Unknown Group"
