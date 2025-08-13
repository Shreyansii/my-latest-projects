'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/useAuth';
import { apiClient } from '@/src/lib/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import {
  ArrowLeft,
  Plus,
  UserPlus,
  Settings,
  DollarSign,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// Define the data types for the group details page
interface GroupDetail {
  id: string;
  name: string;
  description?: string;
  group_avatar_url?: string;
  currency: string;
  created_at: string;
  members: GroupMember[];
  recent_expenses: RecentExpense[];
  total_expenses: number;
  your_balance: number;
  is_admin: boolean;
}

interface GroupMember {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  is_admin: boolean;
  balance: number;
}

interface RecentExpense {
  id: number;
  description: string;
  amount: string;
  currency: string;
  date: string;
  created_by: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
  };
  participants: number[];
  category: number;
}

interface GroupDetailsPageProps {
  params: {
    id: string;
  };
}

export default function GroupDetailsPage({ params }: GroupDetailsPageProps) {
  // FIX: Unwrap params with `use()` hook to prevent the warning and 404 error
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    // With `use(params)`, `id` is guaranteed to be a string when the component renders.
    // We only need to check for authentication status.
    if (isAuthenticated) {
      fetchGroupDetails();
    }
  }, [isAuthenticated, id]);

  const fetchGroupDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const groupData = await apiClient.getGroup(id);
      setGroup(groupData);
    } catch (err: any) {
      console.error('Failed to fetch group details:', err);
      setError(err.message || 'Failed to load group details.');
      toast.error('Error loading group', {
        description: err.message || 'Please try again.',
      });
      if (err.status === 404) {
        router.push('/groups');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };
  
  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGroupInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="p-6 max-w-6xl mx-auto text-center">
        <div className="flex justify-center items-center h-64 flex-col">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <Button onClick={() => router.push('/groups')}>Go to Groups</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push('/groups')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Groups
        </Button>
        <div className="flex items-center space-x-3">
          <Avatar className="h-16 w-16">
            <AvatarImage src={group.group_avatar_url} alt={group.name} />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {getGroupInitials(group.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-4xl font-bold">{group.name}</h1>
            <p className="text-gray-600">{group.description}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          <Link href={`/groups/${group.id}/expenses/new`}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </Link>
          <Link href={`/groups/${group.id}/expenses`}>
            <Button variant="secondary">
              <DollarSign className="w-4 h-4 mr-2" />
              View All Expenses
            </Button>
          </Link>
          <Button variant="outline">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        </div>
        {group.is_admin && (
          <Link href={`/groups/${group.id}/settings`}>
            <Button variant="ghost">
              <Settings className="w-4 h-4 mr-2" />
              Group Settings
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(group.total_expenses, group.currency)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Your Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getBalanceColor(group.your_balance)}`}>
              {formatCurrency(group.your_balance, group.currency)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {group.members.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Group Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {group.members.map(member => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={member.avatar_url} alt={member.email} />
                      <AvatarFallback>
                        {member.first_name[0]}{member.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {member.first_name} {member.last_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <div className={`font-medium text-sm ${getBalanceColor(member.balance)}`}>
                    {formatCurrency(member.balance, group.currency)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {group.recent_expenses.length > 0 ? (
                group.recent_expenses.map(expense => (
                  <div key={expense.id} className="flex justify-between items-center p-3 rounded-md bg-gray-50 hover:bg-gray-100">
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-gray-600">
                        Paid by {expense.created_by.first_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {formatCurrency(parseFloat(expense.amount), expense.currency)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No expenses in this group yet.
                </p>
              )}
            </div>
          </CardContent>
          {group.recent_expenses.length > 0 && (
            <CardFooter>
              <Link href={`/groups/${group.id}/expenses`}>
                <Button variant="link" className="p-0">View all expenses</Button>
              </Link>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}

// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '@/src/hooks/useAuth';
// import { apiClient } from '@/src/lib/api';
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
//   CardDescription,
//   CardFooter
// } from '@/src/components/ui/card';
// import { Button } from '@/src/components/ui/button';
// import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
// import { Separator } from '@/src/components/ui/separator';
// import {
//   ArrowLeft,
//   Plus,
//   UserPlus,
//   Settings,
//   DollarSign,
//   Users,
//   Loader2,
//   AlertCircle
// } from 'lucide-react';
// import Link from 'next/link';
// import { toast } from 'sonner';

// // Define the data types for the group details page
// interface GroupDetail {
//   id: number;
//   name: string;
//   description?: string;
//   group_avatar_url?: string;
//   currency: string;
//   created_at: string;
//   members: GroupMember[];
//   recent_expenses: RecentExpense[];
//   total_expenses: number;
//   your_balance: number;
//   is_admin: boolean;
// }

// interface GroupMember {
//   id: number;
//   email: string;
//   first_name: string;
//   last_name: string;
//   avatar_url?: string;
//   is_admin: boolean;
//   balance: number;
// }

// interface RecentExpense {
//   id: number;
//   description: string;
//   amount: string;
//   currency: string;
//   date: string;
//   created_by: {
//       id: number;
//       first_name: string;
//       last_name: string;
//       email: string;
//   };
//   participants: number[];
//   category: number;
// }

// interface GroupDetailsPageProps {
//   params: {
//     id: string;
//   };
// }

// export default function GroupDetailsPage({ params }: GroupDetailsPageProps) {
//   const { id } = params;
//   const router = useRouter();
//   const { user, loading: authLoading, isAuthenticated } = useAuth();
  
//   const [group, setGroup] = useState<GroupDetail | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!authLoading && !isAuthenticated) {
//       router.push('/login');
//     }
//   }, [authLoading, isAuthenticated, router]);

//   useEffect(() => {
//     if (isAuthenticated && id) {
//       fetchGroupDetails();
//     }
//   }, [isAuthenticated, id]);

//   const fetchGroupDetails = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const groupData = await apiClient.getGroup(parseInt(id, 10));
//       setGroup(groupData);
//     } catch (err: any) {
//       console.error('Failed to fetch group details:', err);
//       setError(err.message || 'Failed to load group details.');
//       toast.error('Error loading group', {
//         description: err.message || 'Please try again.',
//       });
//       if (err.status === 404) {
//         router.push('/groups');
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const formatCurrency = (amount: number, currency: string) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: currency || 'USD',
//     }).format(amount);
//   };
  
//   const getBalanceColor = (balance: number) => {
//     if (balance > 0) return 'text-green-600';
//     if (balance < 0) return 'text-red-600';
//     return 'text-gray-600';
//   };

//   const getGroupInitials = (name: string) => {
//     return name
//       .split(' ')
//       .map(word => word[0])
//       .join('')
//       .toUpperCase()
//       .slice(0, 2);
//   };

//   if (authLoading || isLoading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
//       </div>
//     );
//   }

//   if (error || !group) {
//     return (
//       <div className="p-6 max-w-6xl mx-auto text-center">
//         <div className="flex justify-center items-center h-64 flex-col">
//           <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
//           <h3 className="text-xl font-bold text-gray-900 mb-2">Error</h3>
//           <p className="text-gray-500 mb-6">{error}</p>
//           <Button onClick={() => router.push('/groups')}>Go to Groups</Button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 max-w-6xl mx-auto space-y-6">
//       <div className="flex items-center space-x-4 mb-6">
//         <Button variant="outline" size="sm" onClick={() => router.push('/groups')}>
//           <ArrowLeft className="w-4 h-4 mr-2" />
//           Back to Groups
//         </Button>
//         <div className="flex items-center space-x-3">
//           <Avatar className="h-16 w-16">
//             <AvatarImage src={group.group_avatar_url} alt={group.name} />
//             <AvatarFallback className="bg-blue-100 text-blue-600">
//               {getGroupInitials(group.name)}
//             </AvatarFallback>
//           </Avatar>
//           <div>
//             <h1 className="text-4xl font-bold">{group.name}</h1>
//             <p className="text-gray-600">{group.description}</p>
//           </div>
//         </div>
//       </div>

//       <div className="flex justify-between items-center mb-6">
//         <div className="flex gap-3">
//           <Link href={`/groups/${group.id}/expenses/new`}>
//             <Button>
//               <Plus className="w-4 h-4 mr-2" />
//               Add Expense
//             </Button>
//           </Link>
//           <Button variant="outline">
//             <UserPlus className="w-4 h-4 mr-2" />
//             Invite Member
//           </Button>
//         </div>
//         {group.is_admin && (
//           <Button variant="ghost">
//             <Settings className="w-4 h-4 mr-2" />
//             Group Settings
//           </Button>
//         )}
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <Card>
//           <CardHeader>
//             <CardTitle>Total Expenses</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               {formatCurrency(group.total_expenses, group.currency)}
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader>
//             <CardTitle>Your Balance</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className={`text-2xl font-bold ${getBalanceColor(group.your_balance)}`}>
//               {formatCurrency(group.your_balance, group.currency)}
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader>
//             <CardTitle>Members</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               {group.members.length}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <Card>
//           <CardHeader>
//             <CardTitle>Group Members</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {group.members.map(member => (
//                 <div key={member.id} className="flex items-center justify-between">
//                   <div className="flex items-center space-x-3">
//                     <Avatar>
//                       <AvatarImage src={member.avatar_url} alt={member.email} />
//                       <AvatarFallback>
//                         {member.first_name[0]}{member.last_name[0]}
//                       </AvatarFallback>
//                     </Avatar>
//                     <div>
//                       <p className="font-medium">
//                         {member.first_name} {member.last_name}
//                       </p>
//                       <p className="text-sm text-gray-500">
//                         {member.email}
//                       </p>
//                     </div>
//                   </div>
//                   <div className={`font-medium text-sm ${getBalanceColor(member.balance)}`}>
//                     {formatCurrency(member.balance, group.currency)}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Recent Expenses</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {group.recent_expenses.length > 0 ? (
//                 group.recent_expenses.map(expense => (
//                   <div key={expense.id} className="flex justify-between items-center p-3 rounded-md bg-gray-50 hover:bg-gray-100">
//                     <div>
//                       <p className="font-medium">{expense.description}</p>
//                       <p className="text-sm text-gray-600">
//                         Paid by {expense.created_by.first_name}
//                       </p>
//                     </div>
//                     <div className="text-right">
//                       <p className="font-bold">
//                         {formatCurrency(parseFloat(expense.amount), expense.currency)}
//                       </p>
//                       <p className="text-xs text-gray-500">
//                         {new Date(expense.date).toLocaleDateString()}
//                       </p>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <p className="text-center text-gray-500 py-8">
//                   No expenses in this group yet.
//                 </p>
//               )}
//             </div>
//           </CardContent>
//           {group.recent_expenses.length > 0 && (
//             <CardFooter>
//               <Link href={`/groups/${group.id}/expenses`}>
//                 <Button variant="link" className="p-0">View all expenses</Button>
//               </Link>
//             </CardFooter>
//           )}
//         </Card>
//       </div>
//     </div>
//   );
// }

// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter, useParams } from 'next/navigation';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Separator } from '@/components/ui/separator';
// import { 
//   ArrowLeft, 
//   Plus, 
//   Users, 
//   DollarSign,
//   Calendar,
//   Settings,
//   Loader2,
//   Receipt,
//   TrendingUp,
//   TrendingDown,
//   Minus,
//   MoreVertical,
//   UserPlus
// } from 'lucide-react';
// import Link from 'next/link';
// import { toast } from 'sonner';

// interface groupMember {
//   id: number;
//   email: string;
//   first_name: string;
//   last_name: string;
//   avatar_url?: string;
//   balance: number;
// }

// interface Expense {
//   id: number;
//   description: string;
//   amount: number;
//   currency: string;
//   date: string;
//   created_by: {
//     id: number;
//     first_name: string;
//     last_name: string;
//     email: string;
//   };
//   participants: number[];
//   category?: string;
// }

// interface groupDetails {
//   id: number;
//   name: string;
//   description?: string;
//   group_avatar_url?: string;
//   currency: string;
//   created_at: string;
//   updated_at: string;
//   members: groupMember[];
//   recent_expenses: Expense[];
//   total_expenses: number;
//   your_balance: number;
//   is_admin: boolean;
// }

// export default function groupDetailsPage() {
//   const router = useRouter();
//   const params = useParams();
//   const groupId = params?.id as string;
  
//   const [group, setgroup] = useState<groupDetails | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     if (groupId) {
//       fetchgroupDetails();
//     }
//   }, [groupId]);

//   const fetchgroupDetails = async () => {
//     try {
//       const token = document.cookie
//         .split('; ')
//         .find((row) => row.startsWith('access='))
//         ?.split('=')[1];

//       const response = await fetch(`/api/groups/${groupId}/`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       if (!response.ok) {
//         if (response.status === 404) {
//           toast.error('group not found');
//           router.push('/groups');
//           return;
//         }
//         throw new Error(`Error: ${response.status}`);
//       }

//       const data = await response.json();
//       setgroup(data);
//     } catch (error: any) {
//       console.error('Failed to fetch group details:', error);
//       toast.error('Error loading group details', {
//         description: error.message || 'Something went wrong. Please try again.',
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getInitials = (firstName: string, lastName: string) => {
//     return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
//   };

//   const formatCurrency = (amount: number, currency: string) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: currency || 'USD',
//     }).format(amount);
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//     });
//   };

//   const getBalanceColor = (balance: number) => {
//     if (balance > 0) return 'text-green-600';
//     if (balance < 0) return 'text-red-600';
//     return 'text-gray-600';
//   };

//   const getBalanceIcon = (balance: number) => {
//     if (balance > 0) return <TrendingUp className="h-4 w-4" />;
//     if (balance < 0) return <TrendingDown className="h-4 w-4" />;
//     return <Minus className="h-4 w-4" />;
//   };

//   if (isLoading) {
//     return (
//       <div className="p-6 max-w-6xl mx-auto">
//         <div className="flex justify-center items-center h-64">
//           <Loader2 className="h-8 w-8 animate-spin" />
//         </div>
//       </div>
//     );
//   }

//   if (!group) {
//     return (
//       <div className="p-6 max-w-6xl mx-auto">
//         <div className="text-center py-12">
//           <h3 className="text-lg font-medium text-gray-900 mb-2">group not found</h3>
//           <p className="text-gray-500 mb-6">The group you're looking for doesn't exist.</p>
//           <Link href="/groups">
//             <Button>Back to groups</Button>
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 max-w-6xl mx-auto space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div className="flex items-center space-x-4">
//           <Link href="/groups">
//             <Button variant="outline" size="sm">
//               <ArrowLeft className="w-4 h-4 mr-2" />
//               Back to groups
//             </Button>
//           </Link>
//           <div className="flex items-center space-x-3">
//             <Avatar className="h-12 w-12">
//               <AvatarImage src={group.group_avatar_url} alt={group.name} />
//               <AvatarFallback className="bg-blue-100 text-blue-600">
//                 {group.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
//               </AvatarFallback>
//             </Avatar>
//             <div>
//               <h1 className="text-3xl font-bold">{group.name}</h1>
//               {group.description && (
//                 <p className="text-gray-600">{group.description}</p>
//               )}
//             </div>
//           </div>
//         </div>
        
//         <div className="flex gap-2">
//           <Link href={`/expenses/create?group=${groupId}`}>
//             <Button>
//               <Plus className="w-4 h-4 mr-2" />
//               Add Expense
//             </Button>
//           </Link>
//           {group.is_admin && (
//             <Link href={`/groups/${groupId}/settings`}>
//               <Button variant="outline">
//                 <Settings className="w-4 h-4 mr-2" />
//                 Settings
//               </Button>
//             </Link>
//           )}
//         </div>
//       </div>

//       {/* group Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center space-x-2">
//               <DollarSign className="h-5 w-5 text-blue-600" />
//               <div>
//                 <p className="text-sm text-gray-600">Total Expenses</p>
//                 <p className="text-2xl font-bold">
//                   {formatCurrency(group.total_expenses, group.currency)}
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center space-x-2">
//               {getBalanceIcon(group.your_balance)}
//               <div>
//                 <p className="text-sm text-gray-600">Your Balance</p>
//                 <p className={`text-2xl font-bold ${getBalanceColor(group.your_balance)}`}>
//                   {formatCurrency(group.your_balance, group.currency)}
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center space-x-2">
//               <Users className="h-5 w-5 text-green-600" />
//               <div>
//                 <p className="text-sm text-gray-600">Members</p>
//                 <p className="text-2xl font-bold">{group.members.length}</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Recent Expenses */}
//         <div className="lg:col-span-2">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between">
//               <CardTitle>Recent Expenses</CardTitle>
//               <Link href={`/groups/${groupId}/expenses`}>
//                 <Button variant="outline" size="sm">View All</Button>
//               </Link>
//             </CardHeader>
//             <CardContent>
//               {group.recent_expenses.length === 0 ? (
//                 <div className="text-center py-8">
//                   <Receipt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//                   <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
//                   <p className="text-gray-500 mb-4">Start by adding your first expense to this group.</p>
//                   <Link href={`/expenses/create?group=${groupId}`}>
//                     <Button>
//                       <Plus className="w-4 h-4 mr-2" />
//                       Add Expense
//                     </Button>
//                   </Link>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {group.recent_expenses.map((expense) => (
//                     <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
//                       <div className="flex items-center space-x-3">
//                         <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
//                           <Receipt className="h-5 w-5 text-blue-600" />
//                         </div>
//                         <div>
//                           <p className="font-medium">{expense.description}</p>
//                           <p className="text-sm text-gray-500">
//                             Added by {expense.created_by.first_name} {expense.created_by.last_name} • {formatDate(expense.date)}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <p className="font-semibold">
//                           {formatCurrency(expense.amount, expense.currency)}
//                         </p>
//                         {expense.category && (
//                           <Badge variant="secondary" className="text-xs">
//                             {expense.category}
//                           </Badge>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>

//         {/* Members */}
//         <div>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between">
//               <CardTitle>Members</CardTitle>
//               {group.is_admin && (
//                 <Button variant="outline" size="sm">
//                   <UserPlus className="w-4 h-4 mr-2" />
//                   Invite
//                 </Button>
//               )}
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-3">
//                 {group.members.map((member) => (
//                   <div key={member.id} className="flex items-center justify-between">
//                     <div className="flex items-center space-x-3">
//                       <Avatar className="h-8 w-8">
//                         <AvatarImage src={member.avatar_url} alt={`${member.first_name} ${member.last_name}`} />
//                         <AvatarFallback className="text-xs">
//                           {getInitials(member.first_name, member.last_name)}
//                         </AvatarFallback>
//                       </Avatar>
//                       <div>
//                         <p className="font-medium text-sm">
//                           {member.first_name} {member.last_name}
//                         </p>
//                         <p className="text-xs text-gray-500">{member.email}</p>
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <p className={`text-sm font-medium ${getBalanceColor(member.balance)}`}>
//                         {formatCurrency(member.balance, group.currency)}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* Quick Actions */}
//       <Card>
//         <CardContent className="p-6">
//           <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
//           <div className="flex flex-wrap gap-3">
//             <Link href={`/expenses/create?group=${groupId}`}>
//               <Button variant="outline">
//                 <Plus className="w-4 h-4 mr-2" />
//                 Add Expense
//               </Button>
//             </Link>
//             <Link href={`/groups/${groupId}/expenses`}>
//               <Button variant="outline">
//                 <Receipt className="w-4 h-4 mr-2" />
//                 View All Expenses
//               </Button>
//             </Link>
//             <Link href={`/groups/${groupId}/settle`}>
//               <Button variant="outline">
//                 <DollarSign className="w-4 h-4 mr-2" />
//                 Settle Up
//               </Button>
//             </Link>
//             {group.is_admin && (
//               <Link href={`/groups/${groupId}/settings`}>
//                 <Button variant="outline">
//                   <Settings className="w-4 h-4 mr-2" />
//                   group Settings
//                 </Button>
//               </Link>
//             )}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }