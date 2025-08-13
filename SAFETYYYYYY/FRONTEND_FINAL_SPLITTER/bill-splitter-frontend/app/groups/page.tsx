'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Users, 
  Calendar,
  DollarSign,
  Settings,
  Loader2,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
// FIX: Import the apiClient from the correct path
import { apiClient } from '@/lib/api';

// FIX: Change the id type from number to string to match the UUID backend
interface Group {
  id: string; 
  name: string;
  description?: string;
  group_avatar_url?: string;
  currency: string;
  created_at: string;
  updated_at: string;
  members_count?: number;
  total_expenses?: number;
  your_balance?: number;
}

export default function GroupsPage() {
  const router = useRouter();
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() && Array.isArray(groups)) {
      const filtered = groups.filter(group =>
        group.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredGroups(filtered);
    } else {
      setFilteredGroups(Array.isArray(groups) ? groups : []);
    }
  }, [searchQuery, groups]);

  const fetchGroups = async () => {
    try {
      // FIX: Use the apiClient to make the API call.
      // The apiClient is already configured to use http://localhost:8000
      const groupsResponse = await apiClient.getGroups();
      
      // The apiClient.getGroups() method now returns the array directly
      setGroups(groupsResponse || []);
      setFilteredGroups(groupsResponse || []);

    } catch (error: any) {
      console.error('Failed to fetch groups:', error);
      toast.error('Error loading groups', {
        description: error.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getGroupInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
      month: 'short',
      day: 'numeric',
    });
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Your Groups</h1>
            <p className="text-gray-600">
              Manage your expense groups and track shared costs
            </p>
          </div>
        </div>
        
        <Link href="/groups/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </Link>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <Badge variant="secondary">
            {filteredGroups.length} group{filteredGroups.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Groups Grid */}
      {filteredGroups.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'No groups found' : 'No groups yet'}
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {searchQuery 
              ? 'Try adjusting your search terms to find the group you\'re looking for.'
              : 'Create your first group to start splitting expenses with friends and family.'
            }
          </p>
          {!searchQuery && (
            <Link href="/groups/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Group
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <Card key={group.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={group.group_avatar_url} alt={group.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {getGroupInitials(group.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{group.name}</CardTitle>
                    {group.description && (
                      <p className="text-sm text-gray-500 truncate">
                        {group.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Group Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {group.members_count || 1} member{(group.members_count || 1) !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {formatDate(group.created_at)}
                    </span>
                  </div>
                </div>

                {/* Financial Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total expenses:</span>
                    <span className="font-medium">
                      {formatCurrency(group.total_expenses || 0, group.currency)}
                    </span>
                  </div>
                  {/* REMOVED: Your balance section */}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 justify-end">
                  {/* REMOVED: View button */}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/groups/${group.id}/settings`)}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {/* {filteredGroups.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Link href="/groups/create">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Create New Group
              </Button>
            </Link>
            <Link href="/expenses/create">
              <Button variant="outline">
                <DollarSign className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      )} */}
    </div>
  );
}



// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { 
//   ArrowLeft, 
//   Plus, 
//   Search, 
//   Users, 
//   Calendar,
//   DollarSign,
//   Settings,
//   Loader2,
//   Eye
// } from 'lucide-react';
// import Link from 'next/link';
// import { toast } from 'sonner';
// // FIX: Import the apiClient from the correct path
// import { apiClient } from '@/lib/api';

// interface Group {
//   id: number;
//   name: string;
//   description?: string;
//   group_avatar_url?: string;
//   currency: string;
//   created_at: string;
//   updated_at: string;
//   members_count?: number;
//   total_expenses?: number;
//   your_balance?: number;
// }

// export default function GroupsPage() {
//   const router = useRouter();
  
//   const [groups, setGroups] = useState<Group[]>([]);
//   const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     fetchGroups();
//   }, []);

//   useEffect(() => {
//     if (searchQuery.trim() && Array.isArray(groups)) {
//       const filtered = groups.filter(group =>
//         group.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         group.description?.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//       setFilteredGroups(filtered);
//     } else {
//       setFilteredGroups(Array.isArray(groups) ? groups : []);
//     }
//   }, [searchQuery, groups]);

//   const fetchGroups = async () => {
//     try {
//       // FIX: Use the apiClient to make the API call.
//       // The apiClient is already configured to use http://localhost:8000
//       const groupsResponse = await apiClient.getGroups();
      
//       // The apiClient.getGroups() method now returns the array directly
//       setGroups(groupsResponse || []);
//       setFilteredGroups(groupsResponse || []);

//     } catch (error: any) {
//       console.error('Failed to fetch groups:', error);
//       toast.error('Error loading groups', {
//         description: error.message || 'Something went wrong. Please try again.',
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getGroupInitials = (name: string) => {
//     return name
//       .split(' ')
//       .map(word => word[0])
//       .join('')
//       .toUpperCase()
//       .slice(0, 2);
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

//   if (isLoading) {
//     return (
//       <div className="p-6 max-w-6xl mx-auto">
//         <div className="flex justify-center items-center h-64">
//           <Loader2 className="h-8 w-8 animate-spin" />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 max-w-6xl mx-auto space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div className="flex items-center space-x-4">
//           <Link href="/dashboard">
//             <Button variant="outline" size="sm">
//               <ArrowLeft className="w-4 h-4 mr-2" />
//               Back to Dashboard
//             </Button>
//           </Link>
//           <div>
//             <h1 className="text-3xl font-bold">Your Groups</h1>
//             <p className="text-gray-600">
//               Manage your expense groups and track shared costs
//             </p>
//           </div>
//         </div>
        
//         <Link href="/groups/create">
//           <Button>
//             <Plus className="w-4 h-4 mr-2" />
//             Create Group
//           </Button>
//         </Link>
//       </div>

//       {/* Search and Stats */}
//       <div className="flex flex-col sm:flex-row gap-4 items-center">
//         <div className="relative flex-1 max-w-md">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//           <Input
//             placeholder="Search groups..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="pl-10"
//           />
//         </div>
        
//         <div className="flex items-center gap-4 text-sm text-gray-600">
//           <Badge variant="secondary">
//             {filteredGroups.length} group{filteredGroups.length !== 1 ? 's' : ''}
//           </Badge>
//         </div>
//       </div>

//       {/* Groups Grid */}
//       {filteredGroups.length === 0 ? (
//         <div className="text-center py-12">
//           <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//           <h3 className="text-lg font-medium text-gray-900 mb-2">
//             {searchQuery ? 'No groups found' : 'No groups yet'}
//           </h3>
//           <p className="text-gray-500 mb-6 max-w-md mx-auto">
//             {searchQuery 
//               ? 'Try adjusting your search terms to find the group you\'re looking for.'
//               : 'Create your first group to start splitting expenses with friends and family.'
//             }
//           </p>
//           {!searchQuery && (
//             <Link href="/groups/create">
//               <Button>
//                 <Plus className="w-4 h-4 mr-2" />
//                 Create Your First Group
//               </Button>
//             </Link>
//           )}
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredGroups.map((group) => (
//             <Card key={group.id} className="hover:shadow-lg transition-shadow cursor-pointer">
//               <CardHeader className="pb-3">
//                 <div className="flex items-center space-x-3">
//                   <Avatar className="h-12 w-12">
//                     <AvatarImage src={group.group_avatar_url} alt={group.name} />
//                     <AvatarFallback className="bg-blue-100 text-blue-600">
//                       {getGroupInitials(group.name)}
//                     </AvatarFallback>
//                   </Avatar>
//                   <div className="flex-1 min-w-0">
//                     <CardTitle className="text-lg truncate">{group.name}</CardTitle>
//                     {group.description && (
//                       <p className="text-sm text-gray-500 truncate">
//                         {group.description}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </CardHeader>
              
//               <CardContent className="space-y-4">
//                 {/* Group Stats */}
//                 <div className="grid grid-cols-2 gap-4 text-sm">
//                   <div className="flex items-center space-x-2">
//                     <Users className="h-4 w-4 text-gray-400" />
//                     <span className="text-gray-600">
//                       {group.members_count || 1} member{(group.members_count || 1) !== 1 ? 's' : ''}
//                     </span>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <Calendar className="h-4 w-4 text-gray-400" />
//                     <span className="text-gray-600">
//                       {formatDate(group.created_at)}
//                     </span>
//                   </div>
//                 </div>

//                 {/* Financial Info */}
//                 <div className="space-y-2 text-sm">
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600">Total expenses:</span>
//                     <span className="font-medium">
//                       {formatCurrency(group.total_expenses || 0, group.currency)}
//                     </span>
//                   </div>
//                   {group.your_balance !== undefined && (
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600">Your balance:</span>
//                       <span className={`font-medium ${getBalanceColor(group.your_balance)}`}>
//                         {formatCurrency(group.your_balance, group.currency)}
//                       </span>
//                     </div>
//                   )}
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="flex gap-2 pt-2">
//                   <Button 
//                     variant="outline" 
//                     size="sm" 
//                     className="flex-1"
//                     onClick={() => router.push(`/groups/${group.id}`)}
//                   >
//                     <Eye className="w-4 h-4 mr-2" />
//                     View
//                   </Button>
//                   <Button 
//                     variant="outline" 
//                     size="sm"
//                     onClick={() => router.push(`/groups/${group.id}/settings`)}
//                   >
//                     <Settings className="w-4 h-4" />
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       )}

//       {/* Quick Actions */}
//       {/* {filteredGroups.length > 0 && (
//         <div className="bg-gray-50 rounded-lg p-6 mt-8">
//           <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
//           <div className="flex flex-wrap gap-3">
//             <Link href="/groups/create">
//               <Button variant="outline">
//                 <Plus className="w-4 h-4 mr-2" />
//                 Create New Group
//               </Button>
//             </Link>
//             <Link href="/expenses/create">
//               <Button variant="outline">
//                 <DollarSign className="w-4 h-4 mr-2" />
//                 Add Expense
//               </Button>
//             </Link>
//             <Link href="/dashboard">
//               <Button variant="outline">
//                 <ArrowLeft className="w-4 h-4 mr-2" />
//                 Back to Dashboard
//               </Button>
//             </Link>
//           </div>
//         </div>
//       )} */}
//     </div>
//   );
// }