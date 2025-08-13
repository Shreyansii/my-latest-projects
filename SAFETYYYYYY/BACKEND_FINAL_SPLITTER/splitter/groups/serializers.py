# groups/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Sum, Q

from .models import Group, GroupUser, GroupInvite
from expenses.models import Expense, ExpenseParticipant # Import expense models here to avoid circular imports

User = get_user_model()


class GroupCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new group.
    
    The 'id' field is included to ensure the frontend receives the new group's ID.
    The `create` method handles creating the group and adding the creator as a member.
    """
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    group_avatar_url = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Group
        # FIX: Added 'id' to the fields list
        fields = ['id', 'name', 'description', 'group_avatar_url', 'currency']
        read_only_fields = ('id',) # 'id' is automatically generated

    def create(self, validated_data):
        # Automatically get the authenticated user from the request context
        request = self.context.get('request')

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError({"error": "User must be authenticated to create a group."})

        with transaction.atomic():
            group = Group.objects.create(created_by=request.user, **validated_data)
            GroupUser.objects.create(group=group, user=request.user)
            
        return group


class GroupUserSerializer(serializers.ModelSerializer):
    """Serializer for GroupUser objects, detailing the user's membership."""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_avatar = serializers.CharField(source='user.avatar_url', read_only=True)
    
    class Meta:
        model = GroupUser
        fields = ['user', 'user_name', 'user_email', 'user_avatar', 'is_active', 'created_at']


class GroupMemberSerializer(serializers.ModelSerializer):
    """Serializer for group members - optimized for frontend display."""
    id = serializers.CharField(source='user.id', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    avatar_url = serializers.CharField(source='user.avatar_url', read_only=True)
    is_admin = serializers.SerializerMethodField()
    balance = serializers.SerializerMethodField()
    
    class Meta:
        model = GroupUser
        fields = ['id', 'email', 'first_name', 'last_name', 'avatar_url', 'is_admin', 'balance']
    
    def get_is_admin(self, obj):
        return obj.user == obj.group.created_by
    
    def get_balance(self, obj):
        paid = Expense.objects.filter(group=obj.group, created_by=obj.user).aggregate(total=Sum('amount'))['total'] or 0
        # FIX: Changed 'amount_owed' to 'amount'
        owed = ExpenseParticipant.objects.filter(expense__group=obj.group, user=obj.user).aggregate(total=Sum('amount'))['total'] or 0
        return float(paid - owed)


class RecentExpenseSerializer(serializers.ModelSerializer):
    """Serializer for recent expenses - matches frontend expectations."""
    created_by = serializers.SerializerMethodField()
    participants = serializers.SerializerMethodField()
    
    class Meta:
        model = Expense
        fields = ['id', 'description', 'amount', 'currency', 'date', 'created_by', 'participants', 'category']
    
    def get_created_by(self, obj):
        return {
            'id': obj.created_by.id,
            'first_name': obj.created_by.first_name,
            'last_name': obj.created_by.last_name,
            'email': obj.created_by.email,
        }
    
    def get_participants(self, obj):
        return list(ExpenseParticipant.objects.filter(expense=obj).values_list('user_id', flat=True))


class GroupDetailSerializer(serializers.ModelSerializer):
    """Detailed group serializer for individual group view."""
    members = GroupMemberSerializer(source='groupuser_set', many=True, read_only=True)
    recent_expenses = serializers.SerializerMethodField()
    total_expenses = serializers.SerializerMethodField()
    your_balance = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()
    
    class Meta:
        model = Group
        # FIX: Removed 'updated_at' field
        fields = [
            'id', 'name', 'description', 'group_avatar_url', 'currency',
            'created_at', 'members', 'recent_expenses',
            'total_expenses', 'your_balance', 'is_admin'
        ]
    
    def get_recent_expenses(self, obj):
        recent = Expense.objects.filter(group=obj).order_by('-created_at')[:5]
        return RecentExpenseSerializer(recent, many=True).data
    
    def get_total_expenses(self, obj):
        total = Expense.objects.filter(group=obj).aggregate(total=Sum('amount'))['total'] or 0
        return float(total)
    
    def get_your_balance(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0.0
        
        paid = Expense.objects.filter(group=obj, created_by=request.user).aggregate(total=Sum('amount'))['total'] or 0
        # FIX: Changed 'amount_owed' to 'amount'
        owed = ExpenseParticipant.objects.filter(expense__group=obj, user=request.user).aggregate(total=Sum('amount'))['total'] or 0
        return float(paid - owed)
    
    def get_is_admin(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.created_by == request.user


class GroupListSerializer(serializers.ModelSerializer):
    """Simplified serializer for group listing."""
    members_count = serializers.SerializerMethodField()
    total_expenses = serializers.SerializerMethodField()
    your_balance = serializers.SerializerMethodField()
    
    class Meta:
        model = Group
        # FIX: Removed 'updated_at' field
        fields = [
            'id', 'name', 'description', 'group_avatar_url', 'currency',
            'created_at', 'members_count', 'total_expenses', 'your_balance'
        ]
    
    def get_members_count(self, obj):
        return obj.groupuser_set.filter(is_active=True).count()
    
    def get_total_expenses(self, obj):
        total = Expense.objects.filter(group=obj).aggregate(total=Sum('amount'))['total'] or 0
        return float(total)
    
    def get_your_balance(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0.0
        
        paid = Expense.objects.filter(group=obj, created_by=request.user).aggregate(total=Sum('amount'))['total'] or 0
        # FIX: Changed 'amount_owed' to 'amount'
        owed = ExpenseParticipant.objects.filter(expense__group=obj, user=request.user).aggregate(total=Sum('amount'))['total'] or 0
        return float(paid - owed)


class GroupInviteSerializer(serializers.ModelSerializer):
    """Serializer for GroupInvites, including related user and group data."""
    invite_link = serializers.ReadOnlyField()
    invited_by = serializers.SerializerMethodField()
    group = serializers.SerializerMethodField()
    
    class Meta:
        model = GroupInvite
        fields = ['id', 'email', 'status', 'message', 'created_at', 'expires_at', 
                 'invite_link', 'invited_by', 'group']
        read_only_fields = ['id', 'status', 'created_at', 'expires_at', 'invite_link']
    
    def get_invited_by(self, obj):
        return {
            'first_name': obj.invited_by.first_name,
            'last_name': obj.invited_by.last_name,
            'email': obj.invited_by.email,
            'avatar_url': getattr(obj.invited_by, 'avatar_url', None)
        }
    
    def get_group(self, obj):
        return {
            'id': obj.group.id,
            'name': obj.group.name,
            'description': obj.group.description,
            'group_avatar_url': getattr(obj.group, 'group_avatar_url', None),
            'currency': obj.group.currency,
            'member_count': obj.group.members.count(),
            # Using the Group model's method here to avoid a circular dependency
            'total_expenses': getattr(obj.group, 'get_total_expenses', lambda: 0.0)(),
            'created_at': obj.group.created_at
        }

# class InviteCreateSerializer(serializers.ModelSerializer):
#     emails = serializers.ListField(
#         child=serializers.EmailField(),
#         write_only=True
#     )
    
#     class Meta:
#         model = Invite
#         fields = ['emails', 'group']
    
#     def create(self, validated_data):
#         emails = validated_data.pop('emails')
#         group = validated_data['group']
#         invited_by = self.context['request'].user
#         invites = []
        
#         for email in emails:
#             invite, created = Invite.objects.get_or_create(
#                 email=email,
#                 group=group,
#                 defaults={'invited_by': invited_by}
#             )
#             if created:
#                 invites.append(invite)
        
#         return invites



# from rest_framework import serializers
# from django.contrib.auth import get_user_model
# from .models import Group, GroupUser, Invite
# from django.db import transaction

# User = get_user_model()

# #Rule of thumb: Using source= for simple field access, use SerializerMethodField when need conditions, calculations, or complex logic. 
# #SerializerMethodField used in core app's serializer

# class GroupUserSerializer(serializers.ModelSerializer):
#     user_name = serializers.CharField(source='user.get_full_name', read_only=True)
#     user_email = serializers.CharField(source='user.email', read_only=True)
#     user_avatar = serializers.CharField(source='user.avatar_url', read_only=True)
    
#     class Meta:
#         model = GroupUser
#         fields = ['user', 'user_name', 'user_email', 'user_avatar', 'is_active', 'created_at']

# class GroupSerializer(serializers.ModelSerializer):
#     members_detail = GroupUserSerializer(source='groupuser_set', many=True, read_only=True)
#     member_count = serializers.ReadOnlyField()
#     created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
#     class Meta:
#         model = Group
#         fields = '__all__'
#         read_only_fields = ('created_by', 'created_at')
    
#     @transaction.atomic
#     def create(self, validated_data, **kwargs):
#         # The 'created_by' argument is now available in the kwargs dictionary
#         # because the view's perform_create method passes it.
#         # This prevents the 'multiple values' error.
#         group = Group.objects.create(**validated_data, **kwargs)
        
#         # Add the creator as the first member
#         GroupUser.objects.create(group=group, user=group.created_by)
        
#         return group

# # class GroupCreateSerializer(serializers.ModelSerializer):
# #     class Meta:
# #         model = Group
# #         fields = ['name', 'description', 'group_avatar_url', 'currency']


# class GroupCreateSerializer(serializers.ModelSerializer):
#     description = serializers.CharField(required=False, allow_blank=True, allow_null=True)
#     group_avatar_url = serializers.CharField(required=False, allow_blank=True, allow_null=True)
#     # currency left 
#     class Meta:
#         model = Group
#         fields = ['name', 'description', 'group_avatar_url', 'currency']

#     def create(self, validated_data):
#         request = self.context.get('request')
#         group = Group.objects.create(created_by=request.user, **validated_data)
#         GroupUser.objects.create(group=group, user=request.user)
#         return group

# class InviteSerializer(serializers.ModelSerializer):
#     #for listing all invites
#     invited_by_name = serializers.CharField(source='invited_by.get_full_name', read_only=True)
#     group_name = serializers.CharField(source='group.name', read_only=True)
    
#     class Meta:
#         model = Invite
#         fields = '__all__'
#         read_only_fields = ('invited_by', 'token', 'created_at')

# class InviteCreateSerializer(serializers.ModelSerializer):
#     #for single or multiple invites creation (typically multiple)

#     emails = serializers.ListField(
#         child=serializers.EmailField(),
#         write_only=True
#     )
    
#     class Meta:
#         model = Invite
#         fields = ['emails', 'group']
    
#     def create(self, validated_data):
#         emails = validated_data.pop('emails')
#         group = validated_data['group']
#         invited_by = self.context['request'].user
        
#         invites = []
#         for email in emails:
#             invite, created = Invite.objects.get_or_create(
#                 email=email,
#                 group=group,
#                 defaults={'invited_by': invited_by}
#             )
#             if created:
#                 invites.append(invite)
        
#         return invites