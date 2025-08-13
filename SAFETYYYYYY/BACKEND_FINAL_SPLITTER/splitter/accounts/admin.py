from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Settings

# for basic customization
class CustomUserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('phone', 'avatar_url', 'is_verified')}),
    )
    list_display = ('email', 'username', 'first_name', 'last_name', 'is_verified', 'created_at')
    list_filter = ('is_verified', 'is_active', 'is_staff')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('-created_at',)

class SettingsAdmin(admin.ModelAdmin):
    list_display = ('user', 'dark_mode', 'notify_on_add', 'created_at')
    list_filter = ('dark_mode', 'notify_on_add', 'notify_on_edit', 'notify_on_settle')

    

# Register all models
admin.site.register(User, CustomUserAdmin)
admin.site.register(Settings, SettingsAdmin)