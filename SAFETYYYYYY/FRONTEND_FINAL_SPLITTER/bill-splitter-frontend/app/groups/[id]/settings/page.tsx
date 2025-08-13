'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { apiClient } from '@/src/lib/api';
import { Loader2, ArrowLeft, Plus } from 'lucide-react';
import axios from 'axios';

// ==================== ZOD SCHEMA ====================
const expenseSchema = z.object({
  group: z.number(),
  // ADDED: New title field to the schema
  title: z.string().min(1, 'Title is required'), 
  description: z.string().min(1, 'Description is required'),
  amount: z.string().min(1, 'Amount is required'),
  date: z.string().optional(),
  split_method: z.enum(['equal', 'unequal', 'percentage', 'shares']),
  participants: z.array(
    z.object({
      user: z.number(),
      amount: z.string().optional(),
      percentage: z.string().optional(),
      shares: z.string().optional(),
    })
  ).min(1, 'At least one participant is required'),
});

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// ==================== EXPENSE FORM COMPONENT ====================
// This component is created from the user-provided code
function CreateExpenseForm({ groupId, onExpenseCreated }: { groupId: string | number; onExpenseCreated: () => void }) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ADDED: 'title' to the formData state
  const [formData, setFormData] = useState<any>({
    group: Number(groupId),
    title: '',
    description: '',
    amount: '',
    date: '',
    split_method: 'equal',
    participants: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchGroupMembers();
  }, [groupId]);

  async function fetchGroupMembers() {
    try {
      setIsLoading(true);
      const res = await api.get(`/groups/${groupId}/members/`);
      setGroupMembers(res.data);
      setFormData((prev: any) => ({
        ...prev,
        participants: res.data.map((m: any) => ({
          user: m.id,
          amount: '',
          percentage: '',
          shares: '',
        })),
      }));
    } catch (error) {
      toast.error('Failed to load group members.');
    } finally {
      setIsLoading(false);
    }
  }

  async function createExpense() {
    const parsed = expenseSchema.safeParse(formData);

    if (!parsed.success) {
      const newErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        // FIX: The path to the error can be 'title' or 'description'
        if (issue.path.length > 0) {
          newErrors[issue.path[0]] = issue.message;
        }
      });
      setErrors(newErrors);
      return;
    }
    try {
      await api.post('/expenses/', parsed.data);
      toast.success('Expense created successfully!');
      onExpenseCreated();
      // Reset form
      setFormData({
        group: Number(groupId),
        title: '', // ADDED: Reset the new title field
        description: '',
        amount: '',
        date: '',
        split_method: 'equal',
        participants: groupMembers.map((m: any) => ({
          user: m.id,
          amount: '',
          percentage: '',
          shares: '',
        })),
      });
      setErrors({});
    } catch (error) {
      console.error('Failed to create expense:', error);
      toast.error('Failed to create expense.', {
        description: 'An error occurred. Please check the form data.',
      });
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* ADDED: New Title input field */}
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
      </div>

      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        />
        {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}
      </div>

      <div>
        <Label htmlFor="split_method">Split Method</Label>
        <Select
          value={formData.split_method}
          onValueChange={(val) => setFormData({ ...formData, split_method: val })}
        >
          <SelectTrigger id="split_method">
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="equal">Equal</SelectItem>
            <SelectItem value="unequal">Unequal</SelectItem>
            <SelectItem value="percentage">Percentage</SelectItem>
            <SelectItem value="shares">Shares</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {groupMembers.map((member) => (
        <div key={member.id} className="space-y-1">
          <Label>{member.first_name} {member.last_name}</Label>
          {formData.split_method === 'unequal' && (
            <Input
              placeholder="Amount"
              value={formData.participants.find((p: any) => p.user === member.id)?.amount || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  participants: formData.participants.map((p: any) =>
                    p.user === member.id ? { ...p, amount: e.target.value } : p
                  ),
                })
              }
            />
          )}
          {formData.split_method === 'percentage' && (
            <Input
              placeholder="Percentage"
              value={formData.participants.find((p: any) => p.user === member.id)?.percentage || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  participants: formData.participants.map((p: any) =>
                    p.user === member.id ? { ...p, percentage: e.target.value } : p
                  ),
                })
              }
            />
          )}
          {formData.split_method === 'shares' && (
            <Input
              placeholder="Shares"
              value={formData.participants.find((p: any) => p.user === member.id)?.shares || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  participants: formData.participants.map((p: any) =>
                    p.user === member.id ? { ...p, shares: e.target.value } : p
                  ),
                })
              }
            />
          )}
        </div>
      ))}
      <Button onClick={createExpense} className="w-full">
        <Plus className="w-4 h-4 mr-2" /> Save Expense
      </Button>
    </div>
  );
}

// ==================== MAIN PAGE COMPONENT ====================

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
}

export default function GroupSettingsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [groupMembers, setGroupMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for the remove member dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // State for the new features
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);

  const groupId = params.id;

  useEffect(() => {
    if (groupId) {
      fetchGroupMembers();
    }
  }, [groupId]);

  const fetchGroupMembers = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getGroupMembers(groupId);
      setGroupMembers(response.data.members);
    } catch (error) {
      console.error('Failed to fetch group members:', error);
      toast.error('Failed to load group members.', {
        description: 'Please check your connection and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    try {
      await apiClient.removeGroupMember(groupId, memberId);
      toast.success(`${memberName} has been removed from the group.`);
      setGroupMembers(groupMembers.filter((member) => member.id !== memberId));
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.error('Failed to remove member.', {
        description: 'An error occurred while trying to remove the member.',
      });
    }
  };

  const handleSendInvite = async () => {
    if (!inviteEmail) {
      toast.error('Please enter an email address.');
      return;
    }
    setIsSendingInvite(true);
    try {
      await apiClient.sendGroupInvite(groupId, inviteEmail);
      toast.success('Invitation sent successfully!', {
        description: `An invite has been sent to ${inviteEmail}.`,
      });
      setInviteEmail('');
      setShowInviteDialog(false);
    } catch (error) {
      console.error('Failed to send invitation:', error);
      toast.error('Failed to send invitation.', {
        description: 'An error occurred while trying to send the invite.',
      });
    } finally {
      setIsSendingInvite(false);
    }
  };

  const openRemoveDialog = (member: Member) => {
    setSelectedMember(member);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-4">
          <Link href={`/groups/${groupId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Group
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Group Settings</h1>
            <p className="text-gray-600">Manage group members and settings.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowInviteDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
          <Button onClick={() => setShowExpenseDialog(true)} variant="secondary">
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Group Members</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-gray-200">
            {groupMembers.length > 0 ? (
              groupMembers.map((member) => (
                <li key={member.id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{member.first_name} {member.last_name}</p>
                    {member.is_admin && (
                      <span className="ml-2 text-xs font-medium text-gray-500">Admin</span>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => openRemoveDialog(member)}
                  >
                    Remove
                  </Button>
                </li>
              ))
            ) : (
              <p className="text-center text-gray-500">No members found.</p>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Dialog for inviting members */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Participants</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Enter an email to invite a new member to this group.</p>
            <div>
              <Label htmlFor="invite-email">Email</Label>
              <div className="flex mt-2 space-x-2">
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="Enter email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-grow"
                />
                <Button onClick={handleSendInvite} disabled={isSendingInvite}>
                  {isSendingInvite ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Email'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for adding an expense */}
      <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Expense</DialogTitle>
          </DialogHeader>
          <CreateExpenseForm
            groupId={groupId}
            onExpenseCreated={() => setShowExpenseDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog for removing a member */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently remove {selectedMember?.first_name} {selectedMember?.last_name} from the group. They will lose access to all group data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleRemoveMember(
                selectedMember!.id,
                `${selectedMember!.first_name} ${selectedMember!.last_name}`
              )}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}