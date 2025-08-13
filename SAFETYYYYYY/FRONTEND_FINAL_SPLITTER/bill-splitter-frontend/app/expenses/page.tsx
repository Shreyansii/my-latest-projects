  'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ==================== API CLIENT ====================
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// ==================== ZOD SCHEMA ====================
const expenseSchema = z.object({
  group: z.number(),
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

// ==================== MAIN PAGE ====================
export default function ExpensePage({ groupId }: { groupId: number }) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<any | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);

  const [formData, setFormData] = useState<any>({
    group: groupId,
    description: '',
    amount: '',
    date: '',
    split_method: 'equal',
    participants: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch expenses
  useEffect(() => {
    fetchExpenses();
    fetchGroupMembers();
  }, []);

  async function fetchExpenses() {
    const res = await api.get(`/expenses/?group=${groupId}`);
    setExpenses(res.data);
  }

  async function fetchGroupMembers() {
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
  }

  async function fetchExpenseDetail(id: number) {
    const res = await api.get(`/expenses/${id}/`);
    setSelectedExpense(res.data);
    setShowDetail(true);
  }

 async function createExpense() {
  const parsed = expenseSchema.safeParse(formData);

  if (!parsed.success) {
    const newErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      newErrors[issue.path.join('.')] = issue.message;
    });
    setErrors(newErrors);
    return;
  }
    await api.post('/expenses/', parsed.data);
    fetchExpenses();
    setFormData((prev: any) => ({ ...prev, description: '', amount: '' }));
  }

  // ==================== RENDER ====================
  return (
    <div className="p-6 space-y-6">
      {/* Expense List */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {expenses.map((exp) => (
            <div key={exp.id} className="flex items-center justify-between border-b pb-2">
              <div>
                <p className="font-medium">{exp.description}</p>
                <p className="text-sm text-gray-500">${exp.amount}</p>
              </div>
              <Button variant="outline" onClick={() => fetchExpenseDetail(exp.id)}>
                View
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Create Expense Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create Expense</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Description</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
          </div>

          <div>
            <Label>Amount</Label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
            {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}
          </div>

          <div>
            <Label>Split Method</Label>
            <Select
              value={formData.split_method}
              onValueChange={(val) => setFormData({ ...formData, split_method: val })}
            >
              <SelectTrigger>
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
              <Label>{member.name}</Label>
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

          <Button onClick={createExpense}>Save</Button>
        </CardContent>
      </Card>

      {/* Expense Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-2">
              <p><strong>Description:</strong> {selectedExpense.description}</p>
              <p><strong>Amount:</strong> ${selectedExpense.amount}</p>
              <p><strong>Split Method:</strong> {selectedExpense.split_method}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
