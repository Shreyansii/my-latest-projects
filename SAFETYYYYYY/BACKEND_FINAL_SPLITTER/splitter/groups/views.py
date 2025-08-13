

from rest_framework import generics, status, permissions
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from django.db import models
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

from .models import Group, GroupInvite, GroupUser
from .serializers import (
    GroupCreateSerializer,
    GroupListSerializer,
    GroupDetailSerializer,
    GroupInviteSerializer,
)

class IsGroupMember(permissions.BasePermission):
    """
    Custom permission to only allow members of a group to access it.
    Assumes the view has a queryset that filters groups by the user.
    """
    def has_object_permission(self, request, view, obj):
        # Check if the requesting user is an active member of the group
        return obj.groupuser_set.filter(user=request.user, is_active=True).exists()


class GroupListView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Return groups where the current user is an active member.
        The queryset is ordered by the most recent activity.
        """
        # FIX: Changed 'updated_at' to 'created_at' because 'updated_at' does not exist
        return Group.objects.filter(groupuser__user=self.request.user, groupuser__is_active=True).order_by('-created_at')

    def get_serializer_class(self):
        """
        Dynamically chooses the serializer based on the request method.
        - POST requests (create) use GroupCreateSerializer.
        - GET requests (list) use GroupListSerializer.
        """
        if self.request.method == 'POST':
            return GroupCreateSerializer
        return GroupListSerializer


class GroupDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Get, update, or delete a specific group.
    Only group members can access, and only the admin can update/delete.
    """
    permission_classes = [permissions.IsAuthenticated, IsGroupMember]
    serializer_class = GroupDetailSerializer
    lookup_field = 'pk'
    
    def get_queryset(self):
        # User can only access groups they're a member of
        return Group.objects.filter(
            groupuser__user=self.request.user,
            groupuser__is_active=True
        ).distinct()
    
    def update(self, request, *args, **kwargs):
        group = self.get_object()
        if group.created_by != request.user:
            return Response(
                {'error': 'Only group admin can update group settings'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        group = self.get_object()
        if group.created_by != request.user:
            return Response(
                {'error': 'Only group admin can delete group'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_group_invite(request, group_id):
    """Send an invitation to join a group"""
    try:
        group = Group.objects.get(id=group_id, groupuser__user=request.user)
    except Group.DoesNotExist:
        return Response(
            {'error': 'Group not found or access denied'},
            status=status.HTTP_404_NOT_FOUND
        )
    
   
    
    email = request.data.get('email', '').strip().lower()
    message = request.data.get('message', '')
    
    if not email:
        return Response(
            {'error': 'Email is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if user is already a member
    if GroupUser.objects.filter(group=group, user__email=email).exists():
        return Response(
            {'error': 'User is already a member of this group'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check for existing pending invite
    existing_invite = GroupInvite.objects.filter(
        group=group,
        email=email,
        status='pending',
        expires_at__gt=timezone.now()
    ).first()
    
    if existing_invite:
        return Response(
            {'error': 'A pending invitation already exists for this email'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create new invite
    try:
        invite = GroupInvite.objects.create(
            group=group,
            invited_by=request.user,
            email=email,
            message=message or f"You've been invited to join '{group.name}' expense group!"
        )
    except ValidationError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    # Send email
    try:
        send_invite_email(invite)
    except Exception as e:
        # Log error but don't fail the request
        print(f"Failed to send invite email: {e}")
    
    serializer = GroupInviteSerializer(invite)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_group_invites(request, group_id):
    """List all invites for a group (admin only)"""
    try:
        group = Group.objects.get(id=group_id, groupuser__user=request.user)
    except Group.DoesNotExist:
        return Response(
            {'error': 'Group not found or access denied'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    invites = GroupInvite.objects.filter(group=group).order_by('-created_at')
    serializer = GroupInviteSerializer(invites, many=True)
    return Response({'results': serializer.data})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_invite(request, group_id, invite_id):
    """Cancel a pending invite"""
    try:
        group = Group.objects.get(id=group_id, groupuser__user=request.user)
        invite = GroupInvite.objects.get(id=invite_id, group=group, status='pending')
    except (Group.DoesNotExist, GroupInvite.DoesNotExist):
        return Response(
            {'error': 'Invite not found or access denied'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    invite.status = 'expired'
    invite.save()
    
    return Response({'message': 'Invite cancelled successfully'})

@api_view(['GET'])
@permission_classes([AllowAny])
def get_invite_details(request, token):
    """Get invite details by token (public endpoint)"""
    try:
        invite = GroupInvite.objects.select_related('group', 'invited_by').get(token=token, expires_at__gt=timezone.now(), status='pending')
    except GroupInvite.DoesNotExist:
        return Response(
            {'error': 'Invite not found, expired or invalid'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = GroupInviteSerializer(invite)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_invite(request, token):
    """Accept an invite"""
    try:
        invite = GroupInvite.objects.select_related('group').get(
            token=token, 
            status='pending', 
            expires_at__gt=timezone.now()
        )
    except GroupInvite.DoesNotExist:
        return Response(
            {'error': 'Invite not found, expired or already processed'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.user.email.lower() != invite.email.lower():
        return Response(
            {'error': 'This invite is for a different email address'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if invite.group.groupuser_set.filter(user=request.user).exists():
        return Response(
            {'error': 'You are already a member of this group'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    GroupUser.objects.create(group=invite.group, user=request.user)
    invite.status = 'accepted'
    invite.accepted_at = timezone.now()
    invite.accepted_by = request.user
    invite.save()
    
    return Response({
        'message': 'Successfully joined the group',
        'group_id': invite.group.id
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def decline_invite(request, token):
    """Decline an invite"""
    try:
        invite = GroupInvite.objects.get(token=token, status='pending')
    except GroupInvite.DoesNotExist:
        return Response(
            {'error': 'Invite not found or already processed'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    invite.status = 'declined'
    invite.save()
    
    return Response({'message': 'Invite declined successfully'})

def send_invite_email(invite):
    """Send invitation email"""
    subject = f"You're invited to join {invite.group.name}"
    
    message = f"""
    Hi there!
    
    {invite.invited_by.first_name} {invite.invited_by.last_name} has invited you to join "{invite.group.name}" on our expense sharing platform.
    
    {invite.message if invite.message else ''}
    
    Click the link below to accept or decline the invitation:
    {invite.invite_link}
    
    This invitation will expire on {invite.expires_at.strftime('%B %d, %Y')}.
    
    Best regards,
    The Expense Sharing Team
    """
    
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[invite.email],
        fail_silently=False,
    )





# from rest_framework import generics, status, permissions, serializers
# from rest_framework.decorators import api_view
# from rest_framework.response import Response
# from django.shortcuts import get_object_or_404
# from django.contrib.auth import get_user_model
# from core.permissions import IsGroupMember, IsGroupAdmin
# from core.utils import log_activity
# from .models import Group, GroupUser, Invite
# from .serializers import *
# from django.conf import settings
# from django.core.mail import send_mail
# from drf_spectacular.utils import extend_schema, extend_schema_field
# from rest_framework.exceptions import PermissionDenied

# User = get_user_model()

# # Serializer used for documenting responses in FBVs
# class MessageResponseSerializer(serializers.Serializer):
#     message = serializers.CharField(required=False)
#     error = serializers.CharField(required=False)
#     group = serializers.DictField(required=False)




# class GroupListCreateView(generics.ListCreateAPIView):
#     """
#     API view for listing and creating groups.
#     Only authenticated users can create a new group.
#     """
#     # This is a fallback serializer class, the get_serializer_class method
#     # will determine the correct serializer to use.
#     serializer_class = GroupSerializer
    
#     # This permission class ensures that a user must be authenticated
#     # to access the POST method (to create a group).
#     # If not authenticated, a 401 Unauthorized response is returned immediately.
#     permission_classes = [permissions.IsAuthenticated]

#     def get_queryset(self):
#         """
#         Filters the queryset to only show groups the authenticated user is a member of.
#         The 'swagger_fake_view' check is a DRF workaround for schema generation.
#         """
#         # Avoid AnonymousUser error during schema generation
#         if getattr(self, "swagger_fake_view", False):
#             return Group.objects.none()
        
#         # Return groups where the current user is a member and the group is active.
#         return Group.objects.filter(members=self.request.user, is_active=True)
    
#     def get_serializer_class(self):
#         """
#         Returns a different serializer for POST requests to handle group creation.
#         """
#         if self.request.method == 'POST':
#             return GroupCreateSerializer
#         return GroupSerializer

#     def perform_create(self, serializer):
#         """
#         Overrides the default perform_create method to set the created_by field
#         and log the activity. The permission check is handled by `permission_classes`.
#         """
#         # Save the new group instance, automatically setting the creator.
#         group = serializer.save(created_by=self.request.user)
        
#         # Log the activity of creating the group using the utility function.
#         # The description is generated within the log_activity function itself.
#         log_activity(
#             user=self.request.user,
#             group=group,
#             action_type='group_created',
#             ref_table='groups',
#             ref_obj=group,
#             ref_id=group.id
#         )


# # class GroupListCreateView(generics.ListCreateAPIView):
# #     serializer_class = GroupSerializer
# #     permission_classes = [permissions.IsAuthenticated]
    
# #     def get_queryset(self):
# #         # Avoid AnonymousUser error during schema generation
# #         if getattr(self, "swagger_fake_view", False):
# #             return Group.objects.none()
# #         return Group.objects.filter(members=self.request.user, is_active=True)
    
# #     def get_serializer_class(self):
# #         if self.request.method == 'POST':
# #             return GroupCreateSerializer
# #         return GroupSerializer
    

# # def perform_create(self, serializer):
# #     """
# #     Creates a new group and logs the activity.
# #     The description is automatically generated by the log_activity function.
# #     """
# #     # Check if the user is authenticated before attempting to save.
# #     # This prevents an IntegrityError if the user is an AnonymousUser.
# #     if not self.request.user.is_authenticated:
# #         raise PermissionDenied("You must be authenticated to create a group.")

# #     # Save the new group instance
# #     group = serializer.save(created_by=self.request.user)
    
# #     # Log the activity of creating the group.
# #     # Note: The 'description' argument is removed because log_activity generates it.
# #     # We pass the 'group' object as 'ref_obj' as required by the log_activity function.
# #     log_activity(
# #         user=self.request.user,
# #         group=group,
# #         action_type='group_created',
# #         ref_table='groups',
# #         ref_obj=group,
# #         ref_id=group.id
# #     )



# class GroupDetailView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = GroupSerializer
#     permission_classes = [permissions.IsAuthenticated, IsGroupMember]
    
#     def get_queryset(self):
#         # Avoid AnonymousUser error during schema generation
#         if getattr(self, "swagger_fake_view", False):
#             return Group.objects.none()
#         return Group.objects.filter(members=self.request.user)
    
#     def perform_destroy(self, instance):
#         instance.is_active = False
#         instance.save()
#         log_activity(
#             user=self.request.user,
#             action_type='group_deleted',
#             ref_table='groups',
#             ref_id=instance.id,
#             description=f'Deleted group "{instance.name}"',
#             group=instance
#         )


# # Function-based view to join a group
# @extend_schema(
#     request=None,
#     responses={200: MessageResponseSerializer, 400: MessageResponseSerializer}
# )
# @api_view(['POST'])
# def join_group(request, pk):
#     group = get_object_or_404(Group, pk=pk, is_active=True)
    
#     group_user, created = GroupUser.objects.get_or_create(
#         group=group,
#         user=request.user,
#         defaults={'is_active': True}
#     )
    
#     if not created and not group_user.is_active:
#         group_user.is_active = True
#         group_user.save()
#         created = True
    
#     if created:
#         # Log activity when the user successfully joins the group
#         log_activity(
#             user=request.user,
#             action_type='group_joined',
#             ref_table='groups',
#             ref_id=group.id,
#             description=f'Joined group "{group.name}"',
#             group=group
#         )
#         return Response({'message': 'Successfully joined the group'})
    
#     return Response({'message': 'Already a member of this group'}, status=status.HTTP_400_BAD_REQUEST)


# # Function-based view to leave a group
# @extend_schema(
#     request=None,
#     responses={200: MessageResponseSerializer, 400: MessageResponseSerializer}
# )
# @api_view(['POST'])
# def leave_group(request, pk):
#     group = get_object_or_404(Group, pk=pk)
    
#     try:
#         group_user = GroupUser.objects.get(group=group, user=request.user)
#         group_user.is_active = False
#         group_user.save()
        
#         # Log the leave action
#         log_activity(
#             user=request.user,
#             action_type='group_left',
#             ref_table='groups',
#             ref_id=group.id,
#             description=f'Left group "{group.name}"',
#             group=group
#         )
        
#         return Response({'message': 'Successfully left the group'})
#     except GroupUser.DoesNotExist:
#         return Response({'error': 'Not a member of this group'}, status=status.HTTP_400_BAD_REQUEST)


# class GroupMembersView(generics.ListAPIView):
#     serializer_class = GroupUserSerializer
#     permission_classes = [permissions.IsAuthenticated, IsGroupMember]
    
#     def get_queryset(self):
#         # Avoid error during schema generation
#         if getattr(self, "swagger_fake_view", False):
#             return GroupUser.objects.none()
#         group_id = self.kwargs['pk']
#         return GroupUser.objects.filter(group_id=group_id, is_active=True)


# class InviteCreateView(generics.CreateAPIView):
#     """
#     API view to create and send group invitations.
#     Only authenticated users who are members of the group can send invites.
#     """
#     serializer_class = InviteCreateSerializer
#     permission_classes = [permissions.IsAuthenticated, IsGroupMember]
    
#     def perform_create(self, serializer):
#         """
#         Called after validation but before saving.
#         Saves invites and sends email notifications.
#         """
#         invites = serializer.save()  # Save invite objects to database
#         group = serializer.validated_data['group']
        
#         for invite in invites:
#             # Log the invitation activity
#             log_activity(
#                 user=self.request.user,
#                 action_type='invite_sent',
#                 ref_table='invites',
#                 ref_id=invite.id,
#                 description=f'Invited {invite.email} to join "{group.name}"',
#                 group=group
#             )
            
#             # Send email invitation
#             self.send_invitation_email(invite, group)
    
#     def send_invitation_email(self, invite, group):
#         """
#         Sends email invitation to the invited user.
#         Creates HTML content directly.
#         """
#         try:
#             # Generate invitation URLs for Next.js frontend
#             accept_url = f"{settings.FRONTEND_URL}/accept-invite/{invite.token}"
#             reject_url = f"{settings.FRONTEND_URL}/reject-invite/{invite.token}"
            
#             inviter_name = self.request.user.get_full_name() or self.request.user.username
            
#             # HTML email content 
#             html_message = f"""
#             <!DOCTYPE html>
#             <html>
#             <head>
#                 <meta charset="utf-8">
#                 <style>
#                     body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
#                     .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
#                     .header {{ background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }}
#                     .button {{ display: inline-block; padding: 12px 24px; margin: 10px 5px; text-decoration: none; border-radius: 5px; font-weight: bold; }}
#                     .accept {{ background: #28a745; color: white; }}
#                     .reject {{ background: #dc3545; color: white; }}
#                 </style>
#             </head>
#             <body>
#                 <div class="container">
#                     <div class="header">
#                         <h1>You're Invited to Join {group.name}!</h1>
#                     </div>
#                     <p>Hi there!</p>
#                     <p><strong>{inviter_name}</strong> has invited you to join the group <strong>"{group.name}"</strong>.</p>
#                     <div style="text-align: center; margin: 30px 0;">
#                         <a href="{accept_url}" class="button accept">Accept Invitation</a>
#                         <a href="{reject_url}" class="button reject">Decline Invitation</a>
#                     </div>
#                 </div>
#             </body>
#             </html>
#             """
            
#             # Plain text version
#             plain_message = f"""
# You're invited to join {group.name}!

# {inviter_name} has invited you to join the group "{group.name}".

# Accept: {accept_url}
# Decline: {reject_url}
#             """
            
#             # Send email
#             send_mail(
#                 subject=f'Invitation to join {group.name}',
#                 message=plain_message,
#                 from_email=settings.DEFAULT_FROM_EMAIL,
#                 recipient_list=[invite.email],
#                 html_message=html_message,
#                 fail_silently=False
#             )
            
#         except Exception as e:
#             print(f"Failed to send invitation email: {e}")


# class GroupInvitesView(generics.ListAPIView):
#     """
#     API view to list all pending invitations for a specific group.
#     Only authenticated group members can view group invitations.
#     """
#     serializer_class = InviteSerializer
#     permission_classes = [permissions.IsAuthenticated, IsGroupMember]
    
#     def get_queryset(self):
#         """
#         Filter invites to show only pending invitations for the specified group.
#         """
#         if getattr(self, "swagger_fake_view", False):
#             return Invite.objects.none()
#         group_id = self.kwargs['pk']
#         return Invite.objects.filter(group_id=group_id, status='pending')


# # Function-based view to accept a group invitation
# @extend_schema(
#     request=None,
#     responses={200: MessageResponseSerializer, 400: MessageResponseSerializer, 404: MessageResponseSerializer}
# )
# @api_view(['POST'])
# def accept_invite(request, token):
#     """
#     API endpoint to accept a group invitation.
#     This will be called by Next.js frontend.
#     """
#     try:
#         invite = Invite.objects.get(token=token, status='pending')
        
#         # Security check: ensure user email matches invite email
#         if request.user.email != invite.email:
#             return Response(
#                 {'error': 'Invalid invitation'}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         # Add user to group or reactivate existing membership
#         group_user, created = GroupUser.objects.get_or_create(
#             group=invite.group,
#             user=request.user,
#             defaults={'is_active': True}
#         )
        
#         if not created:
#             group_user.is_active = True
#             group_user.save()
        
#         # Mark invitation as accepted
#         invite.status = 'accepted'
#         invite.save()
        
#         # Log the acceptance activity
#         log_activity(
#             user=request.user,
#             action_type='invite_accepted',
#             ref_table='invites',
#             ref_id=invite.id,
#             description=f'Accepted invitation to join "{invite.group.name}"',
#             group=invite.group
#         )
        
#         return Response({
#             'message': 'Invitation accepted successfully',
#             'group': {
#                 'id': invite.group.id,
#                 'name': invite.group.name
#             }
#         })
        
#     except Invite.DoesNotExist:
#         return Response(
#             {'error': 'Invalid or expired invitation'}, 
#             status=status.HTTP_404_NOT_FOUND
#         )


# # Function-based view to reject a group invitation
# @extend_schema(
#     request=None,
#     responses={200: MessageResponseSerializer, 400: MessageResponseSerializer, 404: MessageResponseSerializer}
# )
# @api_view(['POST'])
# def reject_invite(request, token):
#     """
#     API endpoint to reject a group invitation.
#     This will be called by Next.js frontend.
#     """
#     try:
#         invite = Invite.objects.get(token=token, status='pending')
        
#         if request.user.email != invite.email:
#             return Response(
#                 {'error': 'Invalid invitation'}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         invite.status = 'rejected'
#         invite.save()
        
#         log_activity(
#             user=request.user,
#             action_type='invite_rejected',
#             ref_table='invites',
#             ref_id=invite.id,
#             description=f'Rejected invitation to join "{invite.group.name}"',
#             group=invite.group
#         )
        
#         return Response({'message': 'Invitation rejected'})
        
#     except Invite.DoesNotExist:
#         return Response(
#             {'error': 'Invalid or expired invitation'}, 
#             status=status.HTTP_404_NOT_FOUND
#         )
