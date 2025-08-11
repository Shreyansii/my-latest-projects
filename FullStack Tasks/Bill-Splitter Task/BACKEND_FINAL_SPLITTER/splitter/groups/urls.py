from django.urls import path
from . import views

app_name = 'groups'

urlpatterns = [
    # Group CRUD operations
    path('', views.GroupListCreateView.as_view(), name='group-list-create'),
    path('<int:pk>/', views.GroupDetailView.as_view(), name='group-detail'),
    
    # Group membership actions
    path('<int:pk>/join/', views.join_group, name='join-group'),
    path('<int:pk>/leave/', views.leave_group, name='leave-group'),
    path('<int:pk>/members/', views.GroupMembersView.as_view(), name='group-members'),
    
    # Invitation system
    path('invites/create/', views.InviteCreateView.as_view(), name='invite-create'),
    path('<int:pk>/invites/', views.GroupInvitesView.as_view(), name='group-invites'),
    path('invites/accept/<str:token>/', views.accept_invite, name='accept-invite'),
    path('invites/reject/<str:token>/', views.reject_invite, name='reject-invite'),
]