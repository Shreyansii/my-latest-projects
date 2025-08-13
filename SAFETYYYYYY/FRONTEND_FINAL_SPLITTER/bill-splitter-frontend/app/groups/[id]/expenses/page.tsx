'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Plus, 
  Search,
  Filter,
  Calendar,
  Receipt,
  Loader2,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface ExpenseParticipant {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  amount_owed: number;
}

interface Expense {
  id: number;
  description: string;
  amount: number;
  currency: string;
  date: string;
  category?: string;
  created_by: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
  };
  participants: ExpenseParticipant[];
  created_at: string;
  updated_at: string;
}

interface GroupInfo {
  id: number;
  name: string;
  currency: string;
}

export default function GroupExpensesPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const groupId = params?.id as string;
  
  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (groupId) {
      fetchGroupAndExpenses();
    }
  }, [groupId]);

  useEffect(() => {
    filterExpenses();
  }, [expenses, searchQuery, categoryFilter, dateFilter]);

  const fetchGroupAndExpenses = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('access='))
        ?.split('=')[1];

      // Fetch group info and expenses in parallel
      const [groupResponse, expensesResponse] = await Promise.all([
        fetch(`/api/groups/${groupId}/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`/api/groups/${groupId}/expenses/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      ]);

      if (!groupResponse.ok || !expensesResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [groupData, expensesData] = await Promise.all([
        groupResponse.json(),
        expensesResponse.json()
      ]);

      setGroup({
        id: groupData.id,
        name: groupData.name,
        currency: groupData.currency
      });

      // Handle different API response formats
      const expensesList = Array.isArray(expensesData) ? expensesData : 
                          expensesData.results ? expensesData.results : [];
      
      setExpenses(expensesList);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      toast.error('Error loading expenses', {
        description: error.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterExpenses = () => {
    let filtered = [...expenses];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${expense.created_by.first_name} ${expense.created_by.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(expense => expense.category === categoryFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      if (dateFilter !== 'all') {
        filtered = filtered.filter(expense => new Date(expense.date) >= filterDate);
      }
    }

    setFilteredExpenses(filtered);
  };

  const getUniqueCategories = () => {
    const categories = expenses
      .map(expense => expense.category)
      .filter(Boolean)
      .filter((category, index, self) => self.indexOf(category) === index);
    return categories;
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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const calculateTotalAmount = () => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
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

  if (!group) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Group not found</h3>
          <p className="text-gray-500 mb-6">The group you're looking for doesn't exist.</p>
          <Link href="/groups">
            <Button>Back to Groups</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Link href={`/groups/${groupId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Group
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Expenses</h1>
            <p className="text-gray-600">{group.name}</p>
          </div>
        </div>
        
        <Link href={`/expenses/create?group=${groupId}`}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </Link>
      </div>

      {/* Summary Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold">
                {formatCurrency(calculateTotalAmount(), group.currency)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Number of Expenses</p>
              <p className="text-2xl font-bold">{filteredExpenses.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Average per Expense</p>
              <p className="text-2xl font-bold">
                {filteredExpenses.length > 0 
                  ? formatCurrency(calculateTotalAmount() / filteredExpenses.length, group.currency)
                  : formatCurrency(0, group.currency)
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {getUniqueCategories().map((category) => (
                  <SelectItem key={category} value={category || ''}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">Past Week</SelectItem>
                <SelectItem value="month">Past Month</SelectItem>
                <SelectItem value="quarter">Past 3 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Receipt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {expenses.length === 0 ? 'No expenses yet' : 'No expenses match your filters'}
            </h3>
            <p className="text-gray-500 mb-6">
              {expenses.length === 0 
                ? 'Start by adding your first expense to this group.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {expenses.length === 0 && (
              <Link href={`/expenses/create?group=${groupId}`}>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Expense
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredExpenses.map((expense) => (
            <Card key={expense.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={expense.created_by.avatar_url} />
                      <AvatarFallback>
                        {getInitials(expense.created_by.first_name, expense.created_by.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-lg">{expense.description}</h3>
                        {expense.category && (
                          <Badge variant="secondary">{expense.category}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Added by {expense.created_by.first_name} {expense.created_by.last_name} on {formatDate(expense.date)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Split between {expense.participants.length} member{expense.participants.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {formatCurrency(expense.amount, expense.currency)}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/expenses/${expense.id}`)}
                      >
                        View Details
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}