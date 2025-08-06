from django.contrib import admin
from .models import Category, ActivityLog

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon', 'created_at')
    search_fields = ('name',)
    ordering = ('name',)


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_added_by', 'get_group_name', 'type', 'ref_table', 'ref_id', 'description', 'created_at')
    list_filter = ('type', 'ref_table', 'created_at')
    search_fields = ('user_display_name', 'description')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

    def get_added_by(self, obj):
        if obj.user:
            return obj.user.get_full_name() or obj.user.username
        return obj.user_display_name
    get_added_by.short_description = "Added By"

    def get_group_name(self, obj):
        if obj.group:
            return obj.group.name
        return obj.group_display_name
    get_group_name.short_description = "Group"
