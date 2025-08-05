from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Group, GroupUser, Invite

User = get_user_model()

class GroupUserSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_avatar = serializers.CharField(source='user.avatar_url', read_only=True)
    
    class Meta:
        model = GroupUser
        fields = ['user', 'user_name', 'user_email', 'user_avatar', 'is_active', 'created_at']

class GroupSerializer(serializers.ModelSerializer):
    members_detail = GroupUserSerializer(source='groupuser_set', many=True, read_only=True)
    member_count = serializers.ReadOnlyField()
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Group
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at')
    
    def create(self, validated_data):
        group = Group.objects.create(**validated_data)
        # Add creator as member
        GroupUser.objects.create(group=group, user=group.created_by)
        return group

class GroupCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['name', 'description', 'group_avatar_url', 'currency']

class InviteSerializer(serializers.ModelSerializer):
    invited_by_name = serializers.CharField(source='invited_by.get_full_name', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)
    
    class Meta:
        model = Invite
        fields = '__all__'
        read_only_fields = ('invited_by', 'token', 'created_at')

class InviteCreateSerializer(serializers.ModelSerializer):
    emails = serializers.ListField(
        child=serializers.EmailField(),
        write_only=True
    )
    
    class Meta:
        model = Invite
        fields = ['emails', 'group']
    
    def create(self, validated_data):
        emails = validated_data.pop('emails')
        group = validated_data['group']
        invited_by = self.context['request'].user
        
        invites = []
        for email in emails:
            invite, created = Invite.objects.get_or_create(
                email=email,
                group=group,
                defaults={'invited_by': invited_by}
            )
            if created:
                invites.append(invite)
        
        return invites