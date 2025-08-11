from rest_framework import generics, status, permissions, serializers
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from core.permissions import IsGroupMember, IsGroupAdmin
from core.utils import log_activity
from .models import Group, GroupUser, Invite
from .serializers import *
from django.conf import settings
from django.core.mail import send_mail
from drf_spectacular.utils import extend_schema, extend_schema_field

User = get_user_model()

# Serializer used for documenting responses in FBVs
class MessageResponseSerializer(serializers.Serializer):
    message = serializers.CharField(required=False)
    error = serializers.CharField(required=False)
    group = serializers.DictField(required=False)


class GroupListCreateView(generics.ListCreateAPIView):
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Avoid AnonymousUser error during schema generation
        if getattr(self, "swagger_fake_view", False):
            return Group.objects.none()
        return Group.objects.filter(members=self.request.user, is_active=True)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return GroupCreateSerializer
        return GroupSerializer
    
    def perform_create(self, serializer):
        group = serializer.save(created_by=self.request.user)
        log_activity(
            user=self.request.user,
            action_type='group_created',
            ref_table='groups',
            ref_id=group.id,
            description=f'Created group "{group.name}"',
            group=group
        )


class GroupDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated, IsGroupMember]
    
    def get_queryset(self):
        # Avoid AnonymousUser error during schema generation
        if getattr(self, "swagger_fake_view", False):
            return Group.objects.none()
        return Group.objects.filter(members=self.request.user)
    
    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()
        log_activity(
            user=self.request.user,
            action_type='group_deleted',
            ref_table='groups',
            ref_id=instance.id,
            description=f'Deleted group "{instance.name}"',
            group=instance
        )


# Function-based view to join a group
@extend_schema(
    request=None,
    responses={200: MessageResponseSerializer, 400: MessageResponseSerializer}
)
@api_view(['POST'])
def join_group(request, pk):
    group = get_object_or_404(Group, pk=pk, is_active=True)
    
    group_user, created = GroupUser.objects.get_or_create(
        group=group,
        user=request.user,
        defaults={'is_active': True}
    )
    
    if not created and not group_user.is_active:
        group_user.is_active = True
        group_user.save()
        created = True
    
    if created:
        # Log activity when the user successfully joins the group
        log_activity(
            user=request.user,
            action_type='group_joined',
            ref_table='groups',
            ref_id=group.id,
            description=f'Joined group "{group.name}"',
            group=group
        )
        return Response({'message': 'Successfully joined the group'})
    
    return Response({'message': 'Already a member of this group'}, status=status.HTTP_400_BAD_REQUEST)


# Function-based view to leave a group
@extend_schema(
    request=None,
    responses={200: MessageResponseSerializer, 400: MessageResponseSerializer}
)
@api_view(['POST'])
def leave_group(request, pk):
    group = get_object_or_404(Group, pk=pk)
    
    try:
        group_user = GroupUser.objects.get(group=group, user=request.user)
        group_user.is_active = False
        group_user.save()
        
        # Log the leave action
        log_activity(
            user=request.user,
            action_type='group_left',
            ref_table='groups',
            ref_id=group.id,
            description=f'Left group "{group.name}"',
            group=group
        )
        
        return Response({'message': 'Successfully left the group'})
    except GroupUser.DoesNotExist:
        return Response({'error': 'Not a member of this group'}, status=status.HTTP_400_BAD_REQUEST)


class GroupMembersView(generics.ListAPIView):
    serializer_class = GroupUserSerializer
    permission_classes = [permissions.IsAuthenticated, IsGroupMember]
    
    def get_queryset(self):
        # Avoid error during schema generation
        if getattr(self, "swagger_fake_view", False):
            return GroupUser.objects.none()
        group_id = self.kwargs['pk']
        return GroupUser.objects.filter(group_id=group_id, is_active=True)


class InviteCreateView(generics.CreateAPIView):
    """
    API view to create and send group invitations.
    Only authenticated users who are members of the group can send invites.
    """
    serializer_class = InviteCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsGroupMember]
    
    def perform_create(self, serializer):
        """
        Called after validation but before saving.
        Saves invites and sends email notifications.
        """
        invites = serializer.save()  # Save invite objects to database
        group = serializer.validated_data['group']
        
        for invite in invites:
            # Log the invitation activity
            log_activity(
                user=self.request.user,
                action_type='invite_sent',
                ref_table='invites',
                ref_id=invite.id,
                description=f'Invited {invite.email} to join "{group.name}"',
                group=group
            )
            
            # Send email invitation
            self.send_invitation_email(invite, group)
    
    def send_invitation_email(self, invite, group):
        """
        Sends email invitation to the invited user.
        Creates HTML content directly.
        """
        try:
            # Generate invitation URLs for Next.js frontend
            accept_url = f"{settings.FRONTEND_URL}/accept-invite/{invite.token}"
            reject_url = f"{settings.FRONTEND_URL}/reject-invite/{invite.token}"
            
            inviter_name = self.request.user.get_full_name() or self.request.user.username
            
            # HTML email content 
            html_message = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }}
                    .button {{ display: inline-block; padding: 12px 24px; margin: 10px 5px; text-decoration: none; border-radius: 5px; font-weight: bold; }}
                    .accept {{ background: #28a745; color: white; }}
                    .reject {{ background: #dc3545; color: white; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>You're Invited to Join {group.name}!</h1>
                    </div>
                    <p>Hi there!</p>
                    <p><strong>{inviter_name}</strong> has invited you to join the group <strong>"{group.name}"</strong>.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{accept_url}" class="button accept">Accept Invitation</a>
                        <a href="{reject_url}" class="button reject">Decline Invitation</a>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Plain text version
            plain_message = f"""
You're invited to join {group.name}!

{inviter_name} has invited you to join the group "{group.name}".

Accept: {accept_url}
Decline: {reject_url}
            """
            
            # Send email
            send_mail(
                subject=f'Invitation to join {group.name}',
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[invite.email],
                html_message=html_message,
                fail_silently=False
            )
            
        except Exception as e:
            print(f"Failed to send invitation email: {e}")


class GroupInvitesView(generics.ListAPIView):
    """
    API view to list all pending invitations for a specific group.
    Only authenticated group members can view group invitations.
    """
    serializer_class = InviteSerializer
    permission_classes = [permissions.IsAuthenticated, IsGroupMember]
    
    def get_queryset(self):
        """
        Filter invites to show only pending invitations for the specified group.
        """
        if getattr(self, "swagger_fake_view", False):
            return Invite.objects.none()
        group_id = self.kwargs['pk']
        return Invite.objects.filter(group_id=group_id, status='pending')


# Function-based view to accept a group invitation
@extend_schema(
    request=None,
    responses={200: MessageResponseSerializer, 400: MessageResponseSerializer, 404: MessageResponseSerializer}
)
@api_view(['POST'])
def accept_invite(request, token):
    """
    API endpoint to accept a group invitation.
    This will be called by Next.js frontend.
    """
    try:
        invite = Invite.objects.get(token=token, status='pending')
        
        # Security check: ensure user email matches invite email
        if request.user.email != invite.email:
            return Response(
                {'error': 'Invalid invitation'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Add user to group or reactivate existing membership
        group_user, created = GroupUser.objects.get_or_create(
            group=invite.group,
            user=request.user,
            defaults={'is_active': True}
        )
        
        if not created:
            group_user.is_active = True
            group_user.save()
        
        # Mark invitation as accepted
        invite.status = 'accepted'
        invite.save()
        
        # Log the acceptance activity
        log_activity(
            user=request.user,
            action_type='invite_accepted',
            ref_table='invites',
            ref_id=invite.id,
            description=f'Accepted invitation to join "{invite.group.name}"',
            group=invite.group
        )
        
        return Response({
            'message': 'Invitation accepted successfully',
            'group': {
                'id': invite.group.id,
                'name': invite.group.name
            }
        })
        
    except Invite.DoesNotExist:
        return Response(
            {'error': 'Invalid or expired invitation'}, 
            status=status.HTTP_404_NOT_FOUND
        )


# Function-based view to reject a group invitation
@extend_schema(
    request=None,
    responses={200: MessageResponseSerializer, 400: MessageResponseSerializer, 404: MessageResponseSerializer}
)
@api_view(['POST'])
def reject_invite(request, token):
    """
    API endpoint to reject a group invitation.
    This will be called by Next.js frontend.
    """
    try:
        invite = Invite.objects.get(token=token, status='pending')
        
        if request.user.email != invite.email:
            return Response(
                {'error': 'Invalid invitation'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        invite.status = 'rejected'
        invite.save()
        
        log_activity(
            user=request.user,
            action_type='invite_rejected',
            ref_table='invites',
            ref_id=invite.id,
            description=f'Rejected invitation to join "{invite.group.name}"',
            group=invite.group
        )
        
        return Response({'message': 'Invitation rejected'})
        
    except Invite.DoesNotExist:
        return Response(
            {'error': 'Invalid or expired invitation'}, 
            status=status.HTTP_404_NOT_FOUND
        )
