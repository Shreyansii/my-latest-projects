'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, Mail, Copy, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface InviteModalProps {
  groupId: string;
  groupName: string;
  isAdmin: boolean;
  trigger?: React.ReactNode;
}

interface InviteData {
  email: string;
  message?: string;
}

interface PendingInvite {
  id: number;
  email: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
  expires_at: string;
  invite_link: string;
}

export default function InviteModal({ groupId, groupName, isAdmin, trigger }: InviteModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteData, setInviteData] = useState<InviteData>({ email: '', message: '' });
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [copiedLink, setCopiedLink] = useState<string>('');

  const fetchPendingInvites = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('access='))
        ?.split('=')[1];

      const response = await fetch(`/api/groups/${groupId}/invites/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPendingInvites(data.results || data || []);
      }
    } catch (error) {
      console.error('Failed to fetch pending invites:', error);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && isAdmin) {
      fetchPendingInvites();
    }
  };

  const sendInvite = async () => {
    if (!inviteData.email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('access='))
        ?.split('=')[1];

      const response = await fetch(`/api/groups/${groupId}/invite/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteData.email.trim(),
          message: inviteData.message?.trim() || `You've been invited to join "${groupName}" on our expense sharing platform!`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || error.message || 'Failed to send invite');
      }

      const newInvite = await response.json();
      setPendingInvites(prev => [newInvite, ...prev]);
      setInviteData({ email: '', message: '' });
      
      toast.success('Invite sent successfully!', {
        description: `An invitation has been sent to ${inviteData.email}`,
      });

    } catch (error: any) {
      console.error('Failed to send invite:', error);
      toast.error('Failed to send invite', {
        description: error.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyInviteLink = async (link: string, inviteId: number) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(inviteId.toString());
      toast.success('Invite link copied to clipboard');
      
      // Reset copy state after 2 seconds
      setTimeout(() => {
        setCopiedLink('');
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const cancelInvite = async (inviteId: number) => {
    try {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('access='))
        ?.split('=')[1];

      const response = await fetch(`/api/groups/${groupId}/invites/${inviteId}/cancel/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setPendingInvites(prev => prev.filter(invite => invite.id !== inviteId));
        toast.success('Invite cancelled successfully');
      } else {
        throw new Error('Failed to cancel invite');
      }
    } catch (error) {
      toast.error('Failed to cancel invite');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Members to {groupName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Send New Invite */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="friend@example.com"
                value={inviteData.email}
                onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Custom Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a personal message to your invitation..."
                rows={3}
                value={inviteData.message}
                onChange={(e) => setInviteData(prev => ({ ...prev, message: e.target.value }))}
              />
            </div>

            <Button 
              onClick={sendInvite} 
              className="w-full" 
              disabled={isLoading || !inviteData.email.trim()}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Mail className="w-4 h-4 mr-2" />
              )}
              Send Invitation
            </Button>
          </div>

          {/* Pending Invites */}
          {pendingInvites.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Pending Invitations</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {pendingInvites.map((invite) => (
                  <div key={invite.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{invite.email}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(invite.status)}`}>
                        {invite.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Expires {formatDate(invite.expires_at)}</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => copyInviteLink(invite.invite_link, invite.id)}
                        >
                          {copiedLink === invite.id.toString() ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                        {invite.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-red-600 hover:text-red-700"
                            onClick={() => cancelInvite(invite.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}