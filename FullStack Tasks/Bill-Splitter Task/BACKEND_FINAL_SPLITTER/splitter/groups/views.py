from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from core.permissions import IsGroupMember, IsGroupAdmin
from core.utils import log_activity
from .models import Group, GroupUser, Invite
from .serializers import *

User = get_user_model()

class GroupViewSet(viewsets.ModelViewSet):
    """
    ModelViewSet for handling all Group CRUD operations and related actions
    """
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return groups where user is a member and group is active"""
        return Group.objects.filter(members=self.request.user, is_active=True)
    
    def get_permissions(self):
        """
        Instantiate and return the list of permissions required for this view.
        """
        if self.action in ['retrieve', 'update', 'partial_update', 'destroy', 'members', 'invites']:
            permission_classes = [permissions.IsAuthenticated, IsGroupMember]
        else:
            permission_classes = [permissions.IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return GroupCreateSerializer
        elif self.action == 'invite':
            return InviteCreateSerializer
        elif self.action == 'members':
            return GroupUserSerializer
        elif self.action == 'invites':
            return InviteSerializer
        return GroupSerializer
    
    def perform_create(self, serializer):
        """Create group and log activity"""
        group = serializer.save(created_by=self.request.user)
        log_activity(
            user=self.request.user,
            action_type='group_created',
            ref_table='groups',
            ref_id=group.id,
            description=f'Created group "{group.name}"',
            group=group
        )
    
    def perform_destroy(self, instance):
        """Soft delete group and log activity"""
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
    
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Join a group"""
        group = self.get_object()
        
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
            log_activity(
                user=request.user,
                action_type='group_joined',
                ref_table='groups',
                ref_id=group.id,
                description=f'Joined group "{group.name}"',
                group=group
            )
            return Response({'message': 'Successfully joined the group'})
        
        return Response(
            {'message': 'Already a member of this group'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """Leave a group"""
        group = self.get_object()
        
        try:
            group_user = GroupUser.objects.get(group=group, user=request.user)
            group_user.is_active = False
            group_user.save()
            
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
            return Response(
                {'error': 'Not a member of this group'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        """Get all active members of the group"""
        group = self.get_object()
        members = GroupUser.objects.filter(group=group, is_active=True)
        serializer = self.get_serializer(members, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def invites(self, request, pk=None):
        """Get all pending invitations for the group"""
        group = self.get_object()
        invites = Invite.objects.filter(group=group, status='pending')
        serializer = self.get_serializer(invites, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def invite(self, request, pk=None):
        """Send invitations to join the group"""
        group = self.get_object()
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            serializer.validated_data['group'] = group
            invites = serializer.save()
            
            for invite in invites:
                log_activity(
                    user=request.user,
                    action_type='invite_sent',
                    ref_table='invites',
                    ref_id=invite.id,
                    description=f'Invited {invite.email} to join "{group.name}"',
                    group=group
                )
                # Here you would send email invitation
            
            return Response({'message': 'Invitations sent successfully'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InviteViewSet(viewsets.ModelViewSet):
    """
    ModelViewSet for handling Invite operations
    """
    serializer_class = InviteSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'token'  # Use token instead of pk for lookups
    
    def get_queryset(self):
        """Return invites for the authenticated user"""
        return Invite.objects.filter(email=self.request.user.email)
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return InviteCreateSerializer
        return InviteSerializer
    
    @action(detail=True, methods=['post'])
    def accept(self, request, token=None):
        """Accept an invitation"""
        invite = self.get_object()
        
        # Check if invite is still pending
        if invite.status != 'pending':
            return Response(
                {'error': 'Invitation is no longer pending'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user email matches invite email
        if request.user.email != invite.email:
            return Response(
                {'error': 'Invalid invitation'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Add user to group
        group_user, created = GroupUser.objects.get_or_create(
            group=invite.group,
            user=request.user,
            defaults={'is_active': True}
        )
        
        if not created:
            group_user.is_active = True
            group_user.save()
        
        # Update invite status
        invite.status = 'accepted'
        invite.save()
        
        log_activity(
            user=request.user,
            action_type='invite_accepted',
            ref_table='invites',
            ref_id=invite.id,
            description=f'Accepted invitation to join "{invite.group.name}"',
            group=invite.group
        )
        
        return Response({'message': 'Invitation accepted successfully'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, token=None):
        """Reject an invitation"""
        invite = self.get_object()
        
        # Check if invite is still pending
        if invite.status != 'pending':
            return Response(
                {'error': 'Invitation is no longer pending'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user email matches invite email
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
        
        return Response({'message': 'Invitation rejected successfully'})


# Alternative: Separate ViewSets for better separation of concerns
class GroupUserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing group members (read-only)
    """
    serializer_class = GroupUserSerializer
    permission_classes = [permissions.IsAuthenticated, IsGroupMember]
    
    def get_queryset(self):
        """Return active group members"""
        group_id = self.kwargs.get('group_pk')  # For nested routing
        if group_id:
            return GroupUser.objects.filter(group_id=group_id, is_active=True)
        return GroupUser.objects.filter(is_active=True)


# If you prefer a hybrid approach with some standalone views
class PublicGroupJoinView(APIView):
    """
    Public endpoint for joining groups (doesn't require group membership to access)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        """Join a public group"""
        group = get_object_or_404(Group, pk=pk, is_active=True, is_public=True)
        
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
            log_activity(
                user=request.user,
                action_type='group_joined',
                ref_table='groups',
                ref_id=group.id,
                description=f'Joined public group "{group.name}"',
                group=group
            )
            return Response({'message': 'Successfully joined the group'})
        
        return Response(
            {'message': 'Already a member of this group'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
