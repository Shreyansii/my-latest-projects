// 'use client';

// import { useEffect, useState, useMemo } from 'react';
// import { useAuth } from '@/src/hooks/useAuth';
// import { apiClient } from '@/src/lib/api';
// import { Expense, ActivityLog } from '@/src/types';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/src/components/ui/card';
// import { Button } from '@/src/components/ui/button';
// import { Plus, DollarSign, Users, Activity, LogOut, UsersIcon } from 'lucide-react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   Legend,
// } from 'recharts';

// export default function Dashboard() {
//   const { user, logout, loading: authLoading, isAuthenticated } = useAuth();
//   const [expenses, setExpenses] = useState<Expense[]>([]);
//   const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
//   const [dataLoading, setDataLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();

//   // Debug auth state logging
//   useEffect(() => {
//     console.log('Dashboard - Auth state:', {
//       authLoading,
//       user: !!user,
//       isAuthenticated,
//       userEmail: user?.email,
//     });
//   }, [authLoading, user, isAuthenticated]);

//   // Redirect unauthenticated users to login (after auth check completes)
//   useEffect(() => {
//     if (!authLoading && !isAuthenticated) {
//       console.log('Redirecting to login - user not authenticated');
//       router.push('/login');
//     }
//   }, [authLoading, isAuthenticated, router]);

//   // Fetch dashboard data when user is authenticated and available
//   useEffect(() => {
//     if (!authLoading && isAuthenticated && user) {
//       fetchData();
//     }
//   }, [authLoading, isAuthenticated, user]);

//   // Fetch expenses and activity logs
//   async function fetchData() {
//     setDataLoading(true);
//     setError(null);

//     try {
//       console.log('Making API calls...');
      
//       const [expensesResponse, activityResponse] = await Promise.all([
//         apiClient.getExpenses().catch(err => {
//           console.error('Expenses API error:', err);
//           // Return a valid empty array in case of an error
//           return [];
//         }),
//         apiClient.getActivityLogs().catch(err => {
//           console.error('Activity logs API error:', err);
//           // Return a valid empty array in case of an error
//           return [];
//         }),
//       ]);

//       // Ensure that the data is an array before setting the state
//       const expensesData = Array.isArray(expensesResponse) ? expensesResponse : [];
//       const activityData = Array.isArray(activityResponse) ? activityResponse : [];

//       console.log('API responses:', {
//         expensesCount: expensesData.length,
//         activityCount: activityData.length,
//       });

//       setExpenses(expensesData);
//       setActivityLogs(activityData);

//     } catch (err) {
//       console.error('Error fetching dashboard data:', err);
//       setError('Failed to load dashboard data. Please try refreshing.');
//       setExpenses([]);
//       setActivityLogs([]);
//     } finally {
//       setDataLoading(false);
//     }
//   }
  
//   // FIXED: Simplified the handleLogout function to just call the hook's logout
//   // and let the hook handle the redirect.
//   async function handleLogout() {
//     await logout();
//   }

//   // FIXED: Added a conditional check to ensure 'expenses' is an array before using reduce.
//   const totalExpenses = Array.isArray(expenses)
//     ? expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0)
//     : 0;

//   // Determine best display name for user
//   function getDisplayName() {
//     if (!user) return 'User';

//     if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
//     if (user.first_name) return user.first_name;
//     if (user.last_name) return user.last_name;
//     if (user.username) return user.username;
//     if (user.email) return user.email.split('@')[0];

//     return 'User';
//   }

//   // Memoized data processing for the monthly expenses chart
//   const monthlyExpenseData = useMemo(() => {
//     if (!Array.isArray(expenses)) return [];
    
//     const monthlyData: { [key: string]: number } = {};

//     expenses.forEach(expense => {
//       const date = new Date(expense.created_at);
//       const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
//       monthlyData[month] = (monthlyData[month] || 0) + parseFloat(expense.amount);
//     });

//     return Object.keys(monthlyData).map(month => ({
//       name: month,
//       total: monthlyData[month],
//     }));
//   }, [expenses]);

//   // NEW: Memoized data processing for total expenses paid by each user
//   const userExpenseData = useMemo(() => {
//     if (!Array.isArray(expenses)) return [];

//     const userData: { [key: string]: number } = {};

//     expenses.forEach(expense => {
//       // Assuming expense object has a `created_by` field with a `username`
//       const username = expense.created_by?.username || 'You';
//       userData[username] = (userData[username] || 0) + parseFloat(expense.amount);
//     });

//     return Object.keys(userData).map(user => ({
//       name: user,
//       total: userData[user],
//     }));
//   }, [expenses]);
  
//   const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#7C3AED', '#EC4899'];

//   if (authLoading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Checking authentication...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!isAuthenticated || !user) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Redirecting to login...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-6">
//       <div className="flex justify-between items-center mb-8">
//         <div>
//           <h1 className="text-3xl font-bold">Welcome back, {getDisplayName()}!</h1>
//           <p className="text-gray-600">Here's what's happening with your expenses</p>
//         </div>

//         <div className="flex space-x-4">
//           <Link href="/groups">
//             <Button >
//               <UsersIcon className="w-4 h-4 mr-2" />
//               View My Groups
//             </Button>
//           </Link>

//           <Button variant="outline" onClick={handleLogout} className="flex items-center">
//             <LogOut className="w-4 h-4 mr-2" />
//             Logout
//           </Button>
//         </div>
//       </div>

//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
//           <p className="text-sm text-red-800">{error}</p>
//           <button
//             onClick={fetchData}
//             className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
//           >
//             Try again
//           </button>
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         <Card>
//           <CardHeader className="flex justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
//             <DollarSign className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{dataLoading ? '...' : `$${totalExpenses.toFixed(2)}`}</div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Active Expenses</CardTitle>
//             <Users className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{dataLoading ? '...' : expenses.length}</div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Recent Activities</CardTitle>
//             <Activity className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{dataLoading ? '...' : activityLogs.length}</div>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//         <Card>
//           <CardHeader>
//             <CardTitle>Total Expenses by Month</CardTitle>
//             <CardDescription>Your spending over the last few months.</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {dataLoading ? (
//               <div className="flex justify-center py-8">
//                 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
//               </div>
//             ) : (
//               <div style={{ width: '100%', height: 300 }}>
//                 <ResponsiveContainer>
//                   <BarChart data={monthlyExpenseData}>
//                     <XAxis dataKey="name" />
//                     <YAxis />
//                     <Tooltip />
//                     <Legend />
//                     <Bar dataKey="total" fill="#3B82F6" />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Total Expenses Paid by User</CardTitle>
//             <CardDescription>Breakdown of expenses you've paid for.</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {dataLoading ? (
//               <div className="flex justify-center py-8">
//                 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
//               </div>
//             ) : (
//               <div style={{ width: '100%', height: 300 }}>
//                 <ResponsiveContainer>
//                   <BarChart data={userExpenseData}>
//                     <XAxis dataKey="name" />
//                     <YAxis />
//                     <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Total']} />
//                     <Legend />
//                     <Bar dataKey="total" fill="#FFBB28" />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <Card>
//           <CardHeader>
//             <CardTitle>Recent Expenses</CardTitle>
//             <CardDescription>Your latest expenses</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {dataLoading ? (
//               <div className="flex justify-center py-8">
//                 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
//               </div>
//             ) : expenses.length > 0 ? (
//               <div className="space-y-4">
//                 {expenses.slice(0, 5).map((expense) => (
//                   <div
//                     key={expense.id}
//                     className="flex justify-between p-4 border rounded-lg"
//                   >
//                     <div>
//                       <h3 className="font-medium">{expense.title}</h3>
//                       <p className="text-sm text-gray-600">
//                         {expense.category_detail?.name ?? 'No category'}
//                       </p>
//                     </div>
//                     <div className="text-right">
//                       <p className="font-medium">${parseFloat(expense.amount).toFixed(2)}</p>
//                       <p className="text-sm text-gray-600">
//                         {new Date(expense.created_at).toLocaleDateString()}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-8">
//                 <p className="text-gray-500">No expenses found.</p>
//                 <Link href="/expenses/new">
//                   <Button className="mt-4">
//                     <Plus className="w-4 h-4 mr-2" />
//                     Create your first expense
//                   </Button>
//                 </Link>
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Recent Activity</CardTitle>
//             <CardDescription>Latest activities in your groups</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {dataLoading ? (
//               <div className="flex justify-center py-8">
//                 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
//               </div>
//             ) : activityLogs.length > 0 ? (
//               <div className="space-y-4">
//                 {activityLogs.slice(0, 5).map((log) => (
//                   <div key={log.id} className="flex space-x-4 items-center">
//                     <div className="flex-1">
//                       <p className="text-sm">{log.description}</p>
//                       {log.user?.username && (
//                         <p className="text-xs text-gray-600">
//                           by {log.user.username}
//                         </p>
//                       )}
//                     </div>
//                     <div className="text-xs text-gray-600">
//                       {log.created_at ? new Date(log.created_at).toLocaleDateString() : 'N/A'}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-8">
//                 <p className="text-gray-500">No recent activities.</p>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }




'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/src/hooks/useAuth';
import { apiClient } from '@/src/lib/api';
import { Expense, ActivityLog } from '@/src/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Plus, DollarSign, Users, Activity, LogOut, UsersIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function Dashboard() {
  const { user, logout, loading: authLoading, isAuthenticated } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    console.log('Dashboard - Auth state:', {
      authLoading,
      user: !!user,
      isAuthenticated,
      userEmail: user?.email,
    });
  }, [authLoading, user, isAuthenticated]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('Redirecting to login - user not authenticated');
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      fetchData();
    }
  }, [authLoading, isAuthenticated, user]);

  async function fetchData() {
    setDataLoading(true);
    setError(null);

    try {
      console.log('Making API calls...');
      
      const [expensesResponse, activityResponse] = await Promise.all([
        apiClient.getExpenses().catch(err => {
          console.error('Expenses API error:', err);
          return [];
        }),
        apiClient.getActivityLogs().catch(err => {
          console.error('Activity logs API error:', err);
          return [];
        }),
      ]);

      const expensesData = expensesResponse || [];
      const activityData = activityResponse || [];

      console.log('API responses:', {
        expensesCount: expensesData.length,
        activityCount: activityData.length,
      });

      setExpenses(expensesData);
      setActivityLogs(activityData);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try refreshing.');
      setExpenses([]);
      setActivityLogs([]);
    } finally {
      setDataLoading(false);
    }
  }
  
  // Restored to the original, working handleLogout function.
  // This will work in combination with your original useAuth.tsx file.
  async function handleLogout() {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      router.push('/login');
    }
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

  function getDisplayName() {
    if (!user) return 'User';

    if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
    if (user.first_name) return user.first_name;
    if (user.last_name) return user.last_name;
    if (user.username) return user.username;
    if (user.email) return user.email.split('@')[0];

    return 'User';
  }

  // Memoized data processing for the monthly expenses chart
  const monthlyExpenseData = useMemo(() => {
    const monthlyData: { [key: string]: number } = {};

    expenses.forEach(expense => {
      const date = new Date(expense.created_at);
      const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyData[month] = (monthlyData[month] || 0) + parseFloat(expense.amount);
    });

    return Object.keys(monthlyData).map(month => ({
      name: month,
      total: monthlyData[month],
    }));
  }, [expenses]);

  // NEW: Memoized data processing for total expenses paid by each user
  const userExpenseData = useMemo(() => {
    const userData: { [key: string]: number } = {};

    expenses.forEach(expense => {
      // Assuming expense object has a `created_by` field with a `username`
      const username = expense.created_by?.username || 'You';
      userData[username] = (userData[username] || 0) + parseFloat(expense.amount);
    });

    return Object.keys(userData).map(user => ({
      name: user,
      total: userData[user],
    }));
  }, [expenses]);
  
  const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#7C3AED', '#EC4899'];

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {getDisplayName()}!</h1>
          <p className="text-gray-600">Here's what's happening with your expenses</p>
        </div>

        <div className="flex space-x-4">
          {/* <Link href="/expenses/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </Link> */}

          <Link href="/groups">
            <Button >
              <UsersIcon className="w-4 h-4 mr-2" />
              View My Groups
            </Button>
          </Link>

          <Button variant="outline" onClick={handleLogout} className="flex items-center">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-sm text-red-800">{error}</p>
          <button
            onClick={fetchData}
            className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
          >
            Try again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataLoading ? '...' : `$${totalExpenses.toFixed(2)}`}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Expenses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataLoading ? '...' : expenses.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recent Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataLoading ? '...' : activityLogs.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Expenses by Month</CardTitle>
            <CardDescription>Your spending over the last few months.</CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={monthlyExpenseData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* NEW: Chart now shows total expenses paid by each user */}
        <Card>
          <CardHeader>
            <CardTitle>Total Expenses Paid by User</CardTitle>
            <CardDescription>Breakdown of expenses you've paid for.</CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={userExpenseData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Total']} />
                    <Legend />
                    <Bar dataKey="total" fill="#FFBB28" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>Your latest expenses</CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : expenses.length > 0 ? (
              <div className="space-y-4">
                {expenses.slice(0, 5).map((expense) => (
                  <div
                    key={expense.id}
                    className="flex justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{expense.title}</h3>
                      <p className="text-sm text-gray-600">
                        {expense.category_detail?.name ?? 'No category'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${parseFloat(expense.amount).toFixed(2)}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(expense.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No expenses found.</p>
                <Link href="/expenses/new">
                  <Button className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Create your first expense
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest activities in your groups</CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : activityLogs.length > 0 ? (
              <div className="space-y-4">
                {activityLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex space-x-4 items-center">
                    <div className="flex-1">
                      <p className="text-sm">{log.description}</p>
                      {/* FIXED: Show username instead of full name */}
                      {log.user?.username && (
                        <p className="text-xs text-gray-600">
                          by {log.user.username}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-gray-600">
                      {/* FIXED: Check for valid timestamp to prevent "Invalid Date" */}
                      {log.created_at ? new Date(log.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent activities.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


// 'use client';

// import { useEffect, useState } from 'react';
// import { useAuth } from '@/src/hooks/useAuth';
// import { apiClient } from '@/src/lib/api';
// import { Expense, ActivityLog } from '@/src/types';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/src/components/ui/card';
// import { Button } from '@/src/components/ui/button';
// import { Plus, DollarSign, Users, Activity, LogOut, UsersIcon } from 'lucide-react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';

// export default function Dashboard() {
//   const { user, logout, loading: authLoading, isAuthenticated } = useAuth();
//   const [expenses, setExpenses] = useState<Expense[]>([]);
//   const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
//   const [dataLoading, setDataLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();

//   useEffect(() => {
//     console.log('Dashboard - Auth state:', {
//       authLoading,
//       user: !!user,
//       isAuthenticated,
//       userEmail: user?.email,
//     });
//   }, [authLoading, user, isAuthenticated]);

//   useEffect(() => {
//     if (!authLoading && !isAuthenticated) {
//       console.log('Redirecting to login - user not authenticated');
//       router.push('/login');
//     }
//   }, [authLoading, isAuthenticated, router]);

//   useEffect(() => {
//     if (!authLoading && isAuthenticated && user) {
//       fetchData();
//     }
//   }, [authLoading, isAuthenticated, user]);

//   async function fetchData() {
//     setDataLoading(true);
//     setError(null);

//     try {
//       console.log('Making API calls...');
      
//       const [expensesResponse, activityResponse] = await Promise.all([
//         apiClient.getExpenses().catch(err => {
//           console.error('Expenses API error:', err);
//           return [];
//         }),
//         apiClient.getActivityLogs().catch(err => {
//           console.error('Activity logs API error:', err);
//           return [];
//         }),
//       ]);

//       // FIX: The apiClient methods now return the array directly, so access the response directly
//       const expensesData = expensesResponse || [];
//       const activityData = activityResponse || [];

//       console.log('API responses:', {
//         expensesCount: expensesData.length,
//         activityCount: activityData.length,
//       });

//       setExpenses(expensesData);
//       setActivityLogs(activityData);

//     } catch (err) {
//       console.error('Error fetching dashboard data:', err);
//       setError('Failed to load dashboard data. Please try refreshing.');
//       setExpenses([]);
//       setActivityLogs([]);
//     } finally {
//       setDataLoading(false);
//     }
//   }

//   async function handleLogout() {
//     try {
//       await logout();
//     } catch (err) {
//       console.error('Logout error:', err);
//     } finally {
//       router.push('/login');
//     }
//   }

//   const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

//   function getDisplayName() {
//     if (!user) return 'User';

//     if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
//     if (user.first_name) return user.first_name;
//     if (user.last_name) return user.last_name;
//     if (user.username) return user.username;
//     if (user.email) return user.email.split('@')[0];

//     return 'User';
//   }

//   if (authLoading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Checking authentication...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!isAuthenticated || !user) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Redirecting to login...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-6">
//       <div className="flex justify-between items-center mb-8">
//         <div>
//           <h1 className="text-3xl font-bold">Welcome back, {getDisplayName()}!</h1>
//           <p className="text-gray-600">Here's what's happening with your expenses</p>
//         </div>

//         <div className="flex space-x-4">
//           <Link href="/expenses/new">
//             <Button>
//               <Plus className="w-4 h-4 mr-2" />
//               Add Expense
//             </Button>
//           </Link>

//           <Link href="/groups">
//             <Button variant="secondary">
//               <UsersIcon className="w-4 h-4 mr-2" />
//               View My Groups
//             </Button>
//           </Link>

//           <Button variant="outline" onClick={handleLogout} className="flex items-center">
//             <LogOut className="w-4 h-4 mr-2" />
//             Logout
//           </Button>
//         </div>
//       </div>

//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
//           <p className="text-sm text-red-800">{error}</p>
//           <button
//             onClick={fetchData}
//             className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
//           >
//             Try again
//           </button>
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         <Card>
//           <CardHeader className="flex justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
//             <DollarSign className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{dataLoading ? '...' : `$${totalExpenses.toFixed(2)}`}</div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Active Expenses</CardTitle>
//             <Users className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{dataLoading ? '...' : expenses.length}</div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Recent Activities</CardTitle>
//             <Activity className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{dataLoading ? '...' : activityLogs.length}</div>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <Card>
//           <CardHeader>
//             <CardTitle>Recent Expenses</CardTitle>
//             <CardDescription>Your latest expenses</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {dataLoading ? (
//               <div className="flex justify-center py-8">
//                 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
//               </div>
//             ) : expenses.length > 0 ? (
//               <div className="space-y-4">
//                 {expenses.slice(0, 5).map((expense) => (
//                   <div
//                     key={expense.id}
//                     className="flex justify-between p-4 border rounded-lg"
//                   >
//                     <div>
//                       <h3 className="font-medium">{expense.title}</h3>
//                       <p className="text-sm text-gray-600">
//                         {expense.category_detail?.name ?? 'No category'}
//                       </p>
//                     </div>
//                     <div className="text-right">
//                       <p className="font-medium">${parseFloat(expense.amount).toFixed(2)}</p>
//                       <p className="text-sm text-gray-600">
//                         {new Date(expense.created_at).toLocaleDateString()}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-8">
//                 <p className="text-gray-500">No expenses found.</p>
//                 <Link href="/expenses/new">
//                   <Button className="mt-4">
//                     <Plus className="w-4 h-4 mr-2" />
//                     Create your first expense
//                   </Button>
//                 </Link>
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Recent Activity</CardTitle>
//             <CardDescription>Latest activities in your groups</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {dataLoading ? (
//               <div className="flex justify-center py-8">
//                 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
//               </div>
//             ) : activityLogs.length > 0 ? (
//               <div className="space-y-4">
//                 {activityLogs.slice(0, 5).map((log) => (
//                   <div key={log.id} className="flex space-x-4 items-center">
//                     <div className="flex-1">
//                       <p className="text-sm">{log.action}</p>
//                       <p className="text-xs text-gray-600">
//                         by {log.user?.first_name ?? log.user?.username ?? 'User'}{' '}
//                         {log.user?.last_name ?? ''}
//                       </p>
//                     </div>
//                     <div className="text-xs text-gray-600">
//                       {new Date(log.timestamp).toLocaleDateString()}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-8">
//                 <p className="text-gray-500">No recent activities.</p>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }