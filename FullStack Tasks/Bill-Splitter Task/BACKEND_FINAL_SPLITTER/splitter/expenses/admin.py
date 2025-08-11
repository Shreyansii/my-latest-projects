from django.contrib import admin
from .models import Expense, ExpenseParticipant

class ExpenseParticipantInline(admin.TabularInline):
    """
    Inline for displaying and editing ExpenseParticipant objects
    within the ExpenseAdmin form.
    """
    model = ExpenseParticipant
    extra = 1  # Number of empty forms to display

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Expense model.
    """
    list_display = ('title', 'amount', 'paid_by', 'group', 'split_type', 'date', 'is_active')
    list_filter = ('group', 'paid_by', 'split_type', 'date', 'is_active')
    search_fields = ('title', 'description', 'group__name')
    date_hierarchy = 'date'
    inlines = [ExpenseParticipantInline]
    
    # Optional: Customize the fields that appear in the add/edit form
    fieldsets = (
        (None, {
            'fields': ('title', 'description', 'amount', 'date')
        }),
        ('Expense Details', {
            'fields': ('group', 'created_by', 'paid_by', 'category', 'split_type')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )

    # Automatically set created_by to the current user
    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(ExpenseParticipant)
class ExpenseParticipantAdmin(admin.ModelAdmin):
    """
    Admin configuration for the ExpenseParticipant model.
    """
    list_display = ('user', 'expense', 'amount', 'percentage', 'shares')
    list_filter = ('expense__group', 'expense__paid_by', 'expense__split_type')
    search_fields = ('user__username', 'expense__title')
    raw_id_fields = ('expense', 'user')  # Use a lookup widget for foreign keys