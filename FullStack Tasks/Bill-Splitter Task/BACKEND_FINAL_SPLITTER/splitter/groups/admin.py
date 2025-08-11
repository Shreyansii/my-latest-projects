from django.contrib import admin
from .models import Group, GroupUser, Invite

@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_by', 'member_count', 'currency', 'is_active', 'created_at')
    list_filter = ('is_active', 'currency', 'created_at')
    search_fields = ('name', 'description', 'created_by__username')
    readonly_fields = ('created_at',)
    # filter_horizontal = ('members',)

@admin.register(GroupUser)
class GroupUserAdmin(admin.ModelAdmin):
    list_display = ('group', 'user', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('group__name', 'user__username', 'user__email')

@admin.register(Invite)
class InviteAdmin(admin.ModelAdmin):
    list_display = ('email', 'group', 'invited_by', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('email', 'group__name', 'invited_by__username')
    readonly_fields = ('token', 'created_at')