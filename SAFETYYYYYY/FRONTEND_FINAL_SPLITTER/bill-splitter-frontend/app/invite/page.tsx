'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Check, 
  X, 
  Loader2, 
  AlertCircle,
  UserPlus,
  DollarSign,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface InviteDetails {
  id: number;
  group: {
    id: number;
    name: string;
    description?: string;
    group_avatar_url?: string;
    currency: string;
    member_count: number;
    total_expenses: number;
    created_at: string;
  };
  invited_by: {
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
  };
  email: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;
  expires_at: string;
  created_at: string;
}

interface UserStatus {
  isLoggedIn: boolean;
  user?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export default function InviteJoinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [userStatus, setUserStatus] = useState<UserStatus>({ isLoggedIn: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (token) {
      Promise.all([
        fetchInviteDetails(),
        checkUserStatus()
      ]).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const fetchInviteDetails = async () => {
    try {
      const response = await fetch(`/api/invites/${token}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Invite not found or has expired');
        }
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setInvite(data);
    } catch (error: any) {
      console.error('Failed to fetch invite details:', error);
      toast.error('Invalid Invite Link', {
        description: error.message || 'This invite link is invalid or has expired.',
      });
    }
  };

  const checkUserStatus = async () => {
    try {
      const authToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('access='))
        ?.split('=')[1];

      if (!authToken) {
        setUserStatus({ isLoggedIn: false });
        return;
      }

      const response = await fetch('/api/auth/me/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const user = await response.json();
        setUserStatus({ isLoggedIn: true, user });
      } else {
        setUserStatus({ isLoggedIn: false });
      }
    } catch (error) {
      setUserStatus({ isLoggedIn: false });
    }
  };

  const handleAcceptInvite = async () => {
    if (!userStatus.isLoggedIn) {
      // Redirect to login/register with invite token
      router.push(`/register?invite=${token}&email=${invite?.email || ''}`);
      return;
    }

    setIsProcessing(true);
    try {
      const authToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('access='))
        ?.split('=')[1];

      const response = await fetch(`/api/invites/${token}/accept/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || error.message || 'Failed to accept invite');
      }

      toast.success('Successfully joined the group!', {
        description: `You are now a member of ${invite?.group.name}`,
      });

      // Redirect to the group page
      router.push(`/groups/${invite?.group.id}`);
    } catch (error: any) {
      console.error('Failed to accept invite:', error);
      toast.error('Failed to join group', {
        description: error.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclineInvite = async () => {
    setIsProcessing(true);
    try {
      const authToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('access='))
        ?.split('=')[1];

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`/api/invites/${token}/decline/`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || error.message || 'Failed to decline invite');
      }

      toast.success('Invite declined');
      router.push('/');
    } catch (error: any) {
      console.error('Failed to decline invite:', error);
      toast.error('Failed to decline invite', {
        description: error.message || 'Something went wrong.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isExpired = invite && new Date(invite.expires_at) < new Date();
  const isAlreadyProcessed = invite && invite.status !== 'pending';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading invite details...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invalid Invite Link</h2>
            <p className="text-gray-600 mb-6">This invite link is missing required information.</p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invite Not Found</h2>
            <p className="text-gray-600 mb-6">This invite link is invalid or has expired.</p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <UserPlus className="h-16 w-16 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">You&apos;re Invited!</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Invite Message */}
            <div className="text-center">
              <p className="text-gray-600">
                <span className="font-medium">
                  {invite.invited_by.first_name} {invite.invited_by.last_name}
                </span>
                {' '}has invited you to join
              </p>
              <h3 className="text-xl font-bold mt-2 mb-4">{invite.group.name}</h3>
              {invite.message && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 italic">&quot;{invite.message}&quot;</p>
                </div>
              )}
            </div>

            {/* Group Details */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={invite.group.group_avatar_url} alt={invite.group.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                    {invite.group.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-lg">{invite.group.name}</h4>
                  {invite.group.description && (
                    <p className="text-gray-600 text-sm">{invite.group.description}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex justify-center mb-1">
                    <Users className="h-5 w-5 text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-600">Members</p>
                  <p className="font-semibold">{invite.group.member_count}</p>
                </div>
                <div>
                  <div className="flex justify-center mb-1">
                    <DollarSign className="h-5 w-5 text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-600">Total Expenses</p>
                  <p className="font-semibold">
                    {formatCurrency(invite.group.total_expenses, invite.group.currency)}
                  </p>
                </div>
                <div>
                  <div className="flex justify-center mb-1">
                    <Calendar className="h-5 w-5 text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-semibold text-xs">
                    {formatDate(invite.group.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Invited By */}
            <div className="flex items-center justify-center space-x-3 py-4 border-t border-b">
              <Avatar className="h-10 w-10">
                <AvatarImage src={invite.invited_by.avatar_url} alt={`${invite.invited_by.first_name} ${invite.invited_by.last_name}`} />
                <AvatarFallback className="text-sm">
                  {invite.invited_by.first_name[0]}{invite.invited_by.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {invite.invited_by.first_name} {invite.invited_by.last_name}
                </p>
                <p className="text-sm text-gray-600">{invite.invited_by.email}</p>
              </div>
            </div>

            {/* User Status and Actions */}
            {isExpired ? (
              <div className="text-center p-6 bg-red-50 rounded-lg">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-900 mb-2">Invite Expired</h3>
                <p className="text-red-700 mb-4">
                  This invitation expired on {formatDate(invite.expires_at)}
                </p>
                <p className="text-sm text-red-600">
                  Please ask {invite.invited_by.first_name} to send you a new invitation.
                </p>
              </div>
            ) : isAlreadyProcessed ? (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className={`h-12 w-12 mx-auto mb-4 ${
                  invite.status === 'accepted' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {invite.status === 'accepted' ? <Check className="h-full w-full" /> : <X className="h-full w-full" />}
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Invite {invite.status === 'accepted' ? 'Accepted' : 'Declined'}
                </h3>
                <p className="text-gray-600 mb-4">
                  You have already {invite.status} this invitation.
                </p>
                {invite.status === 'accepted' && (
                  <Link href={`/groups/${invite.group.id}`}>
                    <Button>Go to Group</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {!userStatus.isLoggedIn && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">
                      <strong>Notice:</strong> You need to create an account or sign in to join this group.
                    </p>
                    <p className="text-xs text-blue-600">
                      Clicking &quot;Accept Invite&quot; will redirect you to register with your invited email address.
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={handleAcceptInvite} 
                    className="flex-1"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    Accept Invite
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleDeclineInvite}
                    className="flex-1"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <X className="w-4 h-4 mr-2" />
                    )}
                    Decline
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    This invitation expires on {formatDate(invite.expires_at)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}