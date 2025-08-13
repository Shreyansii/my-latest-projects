

from django.urls import path
from .views import (
    GroupListView, 
    GroupDetailView, 
    send_group_invite, 
    list_group_invites, 
    cancel_invite, 
    get_invite_details, 
    accept_invite, 
    decline_invite
)

urlpatterns = [
    path('groups/', GroupListView.as_view(), name='group-list-create'), 
    path('groups/<uuid:pk>/', GroupDetailView.as_view(), name='group-detail'), # This expects a UUID, not an integer like '1'
    path('groups/<uuid:group_id>/invite/', send_group_invite, name='send-group-invite'),
    path('groups/<uuid:group_id>/invites/', list_group_invites, name='list-group-invites'),
    path('groups/<uuid:group_id>/invites/<uuid:invite_id>/cancel/', cancel_invite, name='cancel-invite'),
    
    path('invites/<str:token>/', get_invite_details, name='get-invite-details'),
    path('invites/<str:token>/accept/', accept_invite, name='accept-invite'),
    path('invites/<str:token>/decline/', decline_invite, name='decline-invite'),
]