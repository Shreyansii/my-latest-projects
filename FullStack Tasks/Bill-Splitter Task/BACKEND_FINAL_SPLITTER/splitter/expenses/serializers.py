from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from decimal import Decimal
from .models import Expense, ExpenseParticipant
from .utils import calculate_split_amounts
from core.serializers import CategorySerializer
from core.utils import log_activity

User = get_user_model()

class ExpenseParticipantSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = ExpenseParticipant
        fields = ['user_id', 'user_name', 'user_email', 'amount', 'percentage', 'shares']

class ExpenseParticipantInputSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    percentage = serializers.DecimalField(max_digits=5, decimal_places=2, required=False)
    shares = serializers.IntegerField(required=False, min_value=1)

class ExpenseListSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    paid_by_name = serializers.CharField(source='paid_by.get_full_name', read_only=True)
    category_detail = CategorySerializer(source='category', read_only=True)
    participant_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Expense
        fields = [
            'id', 'title', 'amount', 'split_type', 'date', 'created_by_name', 
            'paid_by_name', 'category_detail', 'participant_count', 'created_at'
        ]
    
    def get_participant_count(self, obj):
        return obj.participants.count()

class ExpenseDetailSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    paid_by_name = serializers.CharField(source='paid_by.get_full_name', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)
    category_detail = CategorySerializer(source='category', read_only=True)
    participants = ExpenseParticipantSerializer(many=True, read_only=True)
    
    class Meta:
        model = Expense
        fields = [
            'id', 'title', 'description', 'amount', 'split_type', 'date',
            'created_by_name', 'paid_by_name', 'group_name', 'category_detail',
            'participants', 'created_at', 'updated_at'
        ]

class ExpenseCreateUpdateSerializer(serializers.ModelSerializer):
    participants = ExpenseParticipantInputSerializer(many=True, write_only=True)
    
    class Meta:
        model = Expense
        fields = [
            'group', 'paid_by', 'title', 'description', 'amount', 
            'split_type', 'category', 'date', 'participants'
        ]
    
    def validate(self, attrs):
        group = attrs.get('group')
        paid_by = attrs.get('paid_by')
        participants = attrs.get('participants', [])
        split_type = attrs.get('split_type')
        amount = attrs.get('amount')
        
        # Validate paid_by is group member
        if not group.members.filter(id=paid_by.id).exists():
            raise serializers.ValidationError("Payer must be a member of the group")
        
        
        # Validate participants are group members
        group_member_ids = set(group.members.values_list('id', flat=True))
        
    #     flat=True parameter means:
    # Instead of returning a list of tuples like [(1,), (2,), (3,), ...] 
    # where each tuple has one item (the id),
    # It returns a flat list of the values themselves: [1, 2, 3, ...]

        participant_ids = [p['user_id'] for p in participants]
        
        invalid_ids = set(participant_ids) - group_member_ids
        if invalid_ids:
            raise serializers.ValidationError(f"Users {list(invalid_ids)} are not group members")
        
        # Validate no duplicate participants
        if len(participant_ids) != len(set(participant_ids)):
            raise serializers.ValidationError("Duplicate participants not allowed")
        
        # Validate split amounts based on type
        if split_type == 'unequal':
            total_specified = sum(Decimal(str(p.get('amount', 0))) for p in participants)
            if abs(total_specified - amount) > Decimal('0.01'):
                raise serializers.ValidationError("Sum of participant amounts must equal total expense")
        
        elif split_type == 'percentage':
            total_percentage = sum(Decimal(str(p.get('percentage', 0))) for p in participants)
            if abs(total_percentage - 100) > Decimal('0.01'):
                raise serializers.ValidationError("Percentages must sum to 100%")
        
        elif split_type == 'shares':
            #Does the 'shares' key exist in p (participant's data) & is it greater than 0 check
            if not all('shares' in p and p['shares'] > 0 for p in participants):
                raise serializers.ValidationError("All participants must have valid shares")
        
        return attrs
    
    @transaction.atomic
    def create(self, validated_data):
        participants_data = validated_data.pop('participants')
        expense = Expense.objects.create(**validated_data)
        
        # Calculate split amounts
        split_data = calculate_split_amounts(
            expense.amount, 
            expense.split_type, 
            participants_data
        )
        
        # Create participants
        for participant_data in split_data:
            ExpenseParticipant.objects.create(
                expense=expense,
                user_id=participant_data['user_id'],
                amount=participant_data['amount'],
                percentage=participant_data['percentage'],
                shares=participant_data['shares']
            )


        log_activity(
        user=validated_data['paid_by'],
        group=expense.group,
        action_type='expense_creation',
        ref_table='expense',
        ref_obj=expense.title,
        ref_id=expense.id
        )
        
        return expense
    
    @transaction.atomic
    def update(self, instance, validated_data):
        participants_data = validated_data.pop('participants', None)
        
        # Update expense fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if participants_data is not None:
            # Delete existing participants
            instance.participants.all().delete()
            
            # Calculate new split amounts
            split_data = calculate_split_amounts(
                instance.amount,
                instance.split_type,
                participants_data
            )
            
            # Create new participants
            for participant_data in split_data:
                ExpenseParticipant.objects.create(
                    expense=instance,
                    user_id=participant_data['user_id'],
                    amount=participant_data['amount'],
                    percentage=participant_data['percentage'],
                    shares=participant_data['shares']
                )
        

        log_activity(
        user=instance.paid_by,
        group=instance.group,
        action_type='expense_update',
        ref_table='expense',
        ref_obj=instance.title,
        ref_id=instance.id
        )
        
        return instance