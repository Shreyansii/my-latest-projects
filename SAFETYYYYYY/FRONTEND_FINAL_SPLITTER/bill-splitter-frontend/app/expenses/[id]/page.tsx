'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Expense, Group } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowLeft,
  DollarSign,
  Calendar,
  Users,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

export default function ExpensesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  // State
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [filterGroup, setFilterGroup] = useState('all');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // Fetch initial data
  useEffect(() => {
    if (user) {
      fetchInitialData();
    }
  }, [user]);

  // Filter and search expenses
  useEffect(() => {
    let filtered = [...expenses];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.group_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Group filter
    if (filterGroup !== 'all') {
      const groupName = groups.find(g => g.id.toString() === filterGroup)?.name;
      if (groupName) {
        filtered = filtered.filter(expense => 
          expense.group_name === groupName
        );
      }
    }

    // Sort
    switch (sortBy) {
      case 'date_desc':
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'date_asc':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'amount_desc':
        filtered.sort((a, b) => b.amount - a.amount);
        break;
      case 'amount_asc':
        filtered.sort((a, b) => a.amount - b.amount);
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    setFilteredExpenses(filtered);
  }, [expenses, searchTerm, sortBy, filterGroup, groups]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [expensesData, groupsData] = await Promise.all([
        apiClient.getExpenses(),
        apiClient.getGroups()
      ]);
      
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
      setGroups(Array.isArray(groupsData) ? groupsData : []);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast({
        title: "Error",
        description: "Failed to load expenses and groups",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await apiClient.deleteExpense(expenseId);
      setExpenses(expenses.filter(e => e.id !== expenseId));
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    }
  };

  const getSplitTypeColor = (splitType: string) => {
    switch (splitType) {
      case 'equal': return 'bg-blue-100 text-blue-800';
      case 'unequal': return 'bg-green-100 text-green-800';
      case 'percentage': return 'bg-purple-100 text-purple-800';
      case 'shares': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatSplitType = (splitType: string) => {
    switch (splitType) {
      case 'equal': return 'Equal';
      case 'unequal': return 'Unequal';
      case 'percentage': return 'Percentage';
      case 'shares': return 'Shares';
      default: return splitType;
    }
  };

  // Get unique groups for filter based on expenses
  const uniqueGroupNames = Array.from(
    new Set(expenses.map(expense => expense.group_name))
  );
  const uniqueGroups = groups.filter(group => 
    uniqueGroupNames.includes(group.name)
  );

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Expenses</h1>
            <p className="text-gray-600">Manage your group expenses</p>
          </div>
        </div>
        <Link href="/expenses/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterGroup} onValueChange={setFilterGroup}>
              <SelectTrigger>
                <SelectValue placeholder="All Groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                {uniqueGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id.toString()}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Date (Newest)</SelectItem>
                <SelectItem value="date_asc">Date (Oldest)</SelectItem>
                <SelectItem value="amount_desc">Amount (High to Low)</SelectItem>
                <SelectItem value="amount_asc">Amount (Low to High)</SelectItem>
                <SelectItem value="title">Title (A-Z)</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-gray-600 flex items-center">
              {filteredExpenses.length} of {expenses.length} expenses
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <div className="space-y-4">
        {filteredExpenses.length > 0 ? (
          filteredExpenses.map((expense) => (
            <Card key={expense.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold">{expense.title}</h3>
                        {expense.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {expense.description}
                          </p>
                        )}
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/expenses/${expense.id}`}>
                              <Edit className="w-4 h-4 mr-2" />
                              View/Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteExpense(expense.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span className="font-medium text-lg text-black">
                          ${expense.amount.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(expense.date).toLocaleDateString()}
                      </div>

                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-1" />
                        {expense.participant_count} participants
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge className={getSplitTypeColor(expense.split_type)}>
                          {formatSplitType(expense.split_type)}
                        </Badge>
                        {expense.category_detail && (
                          <Badge variant="outline">
                            {expense.category_detail.name}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>
                          Paid by <span className="font-medium">{expense.paid_by_name}</span> in{' '}
                          <span className="font-medium">{expense.group_name}</span>
                        </span>
                        <span className="text-xs">
                          Created {new Date(expense.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-500">
                <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No expenses found</h3>
                <p className="text-sm mb-4">
                  {expenses.length === 0 
                    ? "You haven't created any expenses yet." 
                    : "No expenses match your current filters."
                  }
                </p>
                <Link href="/expenses/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Expense
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}