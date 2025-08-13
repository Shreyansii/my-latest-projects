from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
import uuid
from django.utils import timezone


class Expense(models.Model):
    SPLIT_TYPE_CHOICES = [
        ('equal', 'Split Equally'),
        ('unequal', 'Unequal Amounts'),
        ('percentage', 'By Percentage'),
        ('shares', 'By Shares'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    group = models.ForeignKey(
        'groups.Group', on_delete=models.CASCADE, related_name='expenses'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_expenses'
    )
    paid_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='paid_expenses'
    )

    title = models.CharField(max_length=200, default='No Title')
    description = models.TextField(blank=True)
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )

    split_type = models.CharField(max_length=20, choices=SPLIT_TYPE_CHOICES, default='equal')
    category = models.ForeignKey('core.Category', on_delete=models.SET_NULL, null=True, blank=True)

    date = models.DateField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['group', 'is_active']),
            models.Index(fields=['date']),
        ]

    def __str__(self):
        return f"{self.title} - {self.amount}"


class ExpenseParticipant(models.Model):
    expense = models.ForeignKey(
        Expense, on_delete=models.CASCADE, related_name='participants'
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    amount = models.DecimalField(
        max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))]
    )
    percentage = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    shares = models.IntegerField(
        null=True, blank=True, validators=[MinValueValidator(1)]
    )

    class Meta:
        unique_together = ['expense', 'user']
        indexes = [models.Index(fields=['expense', 'user'])]

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.amount}"






# from django.db import models
# from django.conf import settings
# from django.core.validators import MinValueValidator, MaxValueValidator
# from decimal import Decimal
# import uuid
# from django.utils import timezone

# class Expense(models.Model):
#     SPLIT_TYPE_CHOICES = [
#         ('equal', 'Split Equally'),
#         ('unequal', 'Unequal Amounts'),
#         ('percentage', 'By Percentage'),
#         ('shares', 'By Shares'),
#     ]
    
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     group = models.ForeignKey('groups.Group', on_delete=models.CASCADE, related_name='expenses')
#     created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_expenses')
#     paid_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='paid_expenses')
    
#     title = models.CharField(max_length=200, default='No Title')
#     description = models.TextField(blank=True)
#     amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    
#     split_type = models.CharField(max_length=20, choices=SPLIT_TYPE_CHOICES, default='equal')
#     category = models.ForeignKey('core.Category', on_delete=models.SET_NULL, null=True, blank=True)
    
#     date = models.DateField(default=timezone.now)
#     is_active = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
    
#     class Meta:
#         ordering = ['-date', '-created_at'] #newest date first, then newest created.
#         indexes = [
#             models.Index(fields=['group', 'is_active']),
#             models.Index(fields=['date']),
#         ]
    
#     def __str__(self):
#         return f"{self.title} - {self.amount}"

# class ExpenseParticipant(models.Model):
#     expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name='participants')
#     user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
#     amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))]) 
#     # how much amount he owes back to the payer
#     # payer (paid_by) is also in expense participant but his owe amount is zero  
#     percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, 
#                                    validators=[MinValueValidator(0), MaxValueValidator(100)])
#     shares = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(1)])
    
#     class Meta:
#         unique_together = ['expense', 'user'] #prevents duplicate participant for the same expense.
#         indexes = [models.Index(fields=['expense', 'user'])]
    
#     def __str__(self):
#         return f"{self.user.get_full_name()} - {self.amount}"






