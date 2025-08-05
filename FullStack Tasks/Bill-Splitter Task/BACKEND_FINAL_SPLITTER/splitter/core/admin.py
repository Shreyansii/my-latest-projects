from django.contrib import admin
from .models import Category, ActivityLog

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon', 'created_at')
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'ref_table', 'ref_id', 'created_at')
    list_filter = ('type', 'ref_table', 'created_at')
    search_fields = ('user__username', 'description')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)