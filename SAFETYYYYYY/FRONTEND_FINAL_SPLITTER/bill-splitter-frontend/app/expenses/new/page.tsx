'use client';

 

import { useState } from 'react';

import { z } from 'zod';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { Label } from '@/components/ui/label';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { toast } from 'sonner';

 

// Zod schema for validation

const expenseSchema = z.object({

title: z.string().min(1, 'Title is required'),

amount: z.number({

required_error: 'Amount is required',

invalid_type_error: 'Amount must be a number',

}).positive('Amount must be positive'),

category: z.number({

required_error: 'Category is required',

invalid_type_error: 'Category must be a number',

}),

group: z.number({

required_error: 'Group is required',

invalid_type_error: 'Group must be a number',

}),

paid_by: z.number({

required_error: 'Paid by is required',

invalid_type_error: 'Paid by must be a number',

}),

split_type: z.enum(['equal', 'unequal', 'percentage', 'shares']),

participants: z.array(

z.object({

user_id: z.number(),

amount: z.number().optional(),

percentage: z.number().optional(),

shares: z.number().optional(),

})

).min(1, 'At least one participant is required'),

});

 

export default function NewExpensePage() {

// Mock dropdown data (replace with API calls later)

const categories = [

{ id: 1, name: 'Food & Drinks' },

{ id: 2, name: 'Travel' },

{ id: 3, name: 'Utilities' },

];

const groups = [

{ id: 1, name: 'Friends Trip' },

{ id: 2, name: 'Family' },

];

 

const [formData, setFormData] = useState({

title: '',

amount: '',

category: '',

group: '',

paid_by: '1', // default current user ID (change later)

split_type: 'equal',

participants: [],

});

 

const handleSubmit = (e: React.FormEvent) => {

e.preventDefault();

const parsed = expenseSchema.safeParse({

...formData,

amount: Number(formData.amount),

category: Number(formData.category),

group: Number(formData.group),

paid_by: Number(formData.paid_by),

});

 

if (!parsed.success) {

toast.error('Please fix the form errors.');

console.error(parsed.error.format());

return;

}

 

toast.success('Expense saved successfully!');

console.log('Form submitted:', parsed.data);

};

 

return (

<div className="p-6 flex justify-center">

<Card className="w-full max-w-lg shadow-lg">

<CardHeader>

<CardTitle className="text-2xl font-bold">Add New Expense</CardTitle>

</CardHeader>

<CardContent>

<form onSubmit={handleSubmit} className="space-y-4">

{/* Title */}

<div>

<Label htmlFor="title">Title</Label>

<Input

id="title"

placeholder="e.g. Dinner at Cafe"

value={formData.title}

onChange={(e) => setFormData({ ...formData, title: e.target.value })}

/>

</div>

 

{/* Amount */}

<div>

<Label htmlFor="amount">Amount</Label>

<Input

id="amount"

type="number"

placeholder="0.00"

value={formData.amount}

onChange={(e) => setFormData({ ...formData, amount: e.target.value })}

/>

</div>

 

{/* Category Dropdown */}

<div>

<Label>Category</Label>

<Select

onValueChange={(val) => setFormData({ ...formData, category: val })}

>

<SelectTrigger>

<SelectValue placeholder="Select category" />

</SelectTrigger>

<SelectContent>

{categories.map((cat) => (

<SelectItem key={cat.id} value={String(cat.id)}>

{cat.name}

</SelectItem>

))}

</SelectContent>

</Select>

</div>

 

{/* Group Dropdown */}

<div>

<Label>Group</Label>

<Select

onValueChange={(val) => setFormData({ ...formData, group: val })}

>

<SelectTrigger>

<SelectValue placeholder="Select group" />

</SelectTrigger>

<SelectContent>

{groups.map((grp) => (

<SelectItem key={grp.id} value={String(grp.id)}>

{grp.name}

</SelectItem>

))}

</SelectContent>

</Select>

</div>

 

{/* Split Type */}

<div>

<Label>Split Type</Label>

<Select

value={formData.split_type}

onValueChange={(val) => setFormData({ ...formData, split_type: val })}

>

<SelectTrigger>

<SelectValue />

</SelectTrigger>

<SelectContent>

<SelectItem value="equal">Equal</SelectItem>

<SelectItem value="unequal">Unequal</SelectItem>

<SelectItem value="percentage">Percentage</SelectItem>

<SelectItem value="shares">Shares</SelectItem>

</SelectContent>

</Select>

</div>

 

<Button type="submit" className="w-full">

Save Expense

</Button>

</form>

</CardContent>

</Card>

</div>

);

}






// 'use client';

// import { useEffect, useState } from 'react';
// import { z } from 'zod';
// import { toast } from 'sonner';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { apiClient } from '@/src/lib/api';

// // Zod schema for validation
// const expenseSchema = z.object({
//   title: z.string().min(1, 'Title is required'),
//   amount: z
//     .number({
//       required_error: 'Amount is required',
//       invalid_type_error: 'Amount must be a number',
//     })
//     .positive('Amount must be positive'),
//   category: z.number({
//     required_error: 'Category is required',
//     invalid_type_error: 'Category must be a number',
//   }),
//   group: z.number({
//     required_error: 'Group is required',
//     invalid_type_error: 'Group must be a number',
//   }),
//   paid_by: z.number({
//     required_error: 'Paid by is required',
//     invalid_type_error: 'Paid by must be a number',
//   }),
//   split_type: z.enum(['equal', 'unequal', 'percentage', 'shares']),
//   participants: z
//     .array(
//       z.object({
//         user_id: z.number(),
//         amount: z.number().optional(),
//         percentage: z.number().optional(),
//         shares: z.number().optional(),
//       })
//     )
//     .min(1, 'At least one participant is required'),
// });

// export default function NewExpensePage() {
//   // State for backend data
//   const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
//   const [groups, setGroups] = useState<{ id: number; name: string }[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Form state
//   const [formData, setFormData] = useState({
//     title: '',
//     amount: '',
//     category: '',
//     group: '',
//     paid_by: '1', // default user id - adjust as needed
//     split_type: 'equal',
//     participants: [], // You can expand this with participant UI later
//   });

//   // Fetch categories and groups on mount
//   useEffect(() => {
//     setLoading(true);
//     setError(null);
//     Promise.all([apiClient.getCategories(), apiClient.getGroups()])
//       .then(([categoriesData, groupsData]) => {
//         setCategories(Array.isArray(categoriesData) ? categoriesData : []);
//         setGroups(Array.isArray(groupsData) ? groupsData : []);
//       })
//       .catch((err) => {
//         console.error('Error fetching categories or groups:', err);
//         setError('Failed to load categories or groups.');
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     const parsed = expenseSchema.safeParse({
//       ...formData,
//       amount: Number(formData.amount),
//       category: Number(formData.category),
//       group: Number(formData.group),
//       paid_by: Number(formData.paid_by),
//     });

//     if (!parsed.success) {
//       toast.error('Please fix the form errors.');
//       console.error(parsed.error.format());
//       return;
//     }

//     apiClient
//       .createExpense(parsed.data)
//       .then(() => {
//         toast.success('Expense saved successfully!');
//         // Optionally reset form or navigate
//       })
//       .catch((err) => {
//         console.error('Error saving expense:', err);
//         toast.error('Failed to save expense.');
//       });
//   };

//   if (loading) {
//     return <div className="p-6 text-center">Loading form data...</div>;
//   }

//   if (error) {
//     return <div className="p-6 text-center text-red-600">{error}</div>;
//   }

//   return (
//     <div className="p-6 flex justify-center">
//       <Card className="w-full max-w-lg shadow-lg">
//         <CardHeader>
//           <CardTitle className="text-2xl font-bold">Add New Expense</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             {/* Title */}
//             <div>
//               <Label htmlFor="title">Title</Label>
//               <Input
//                 id="title"
//                 placeholder="e.g. Dinner at Cafe"
//                 value={formData.title}
//                 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//               />
//             </div>

//             {/* Amount */}
//             <div>
//               <Label htmlFor="amount">Amount</Label>
//               <Input
//                 id="amount"
//                 type="number"
//                 placeholder="0.00"
//                 value={formData.amount}
//                 onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
//               />
//             </div>

//             {/* Category Dropdown */}
//             <div>
//               <Label>Category</Label>
//               <Select
//                 value={formData.category}
//                 onValueChange={(val) => setFormData({ ...formData, category: val })}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select category" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {Array.isArray(categories) &&
//                     categories.map((cat) => (
//                       <SelectItem key={cat.id} value={String(cat.id)}>
//                         {cat.name}
//                       </SelectItem>
//                     ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Group Dropdown */}
//             <div>
//               <Label>Group</Label>
//               <Select
//                 value={formData.group}
//                 onValueChange={(val) => setFormData({ ...formData, group: val })}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select group" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {Array.isArray(groups) &&
//                     groups.map((grp) => (
//                       <SelectItem key={grp.id} value={String(grp.id)}>
//                         {grp.name}
//                       </SelectItem>
//                     ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Split Type */}
//             <div>
//               <Label>Split Type</Label>
//               <Select
//                 value={formData.split_type}
//                 onValueChange={(val) => setFormData({ ...formData, split_type: val })}
//               >
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="equal">Equal</SelectItem>
//                   <SelectItem value="unequal">Unequal</SelectItem>
//                   <SelectItem value="percentage">Percentage</SelectItem>
//                   <SelectItem value="shares">Shares</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <Button type="submit" className="w-full">
//               Save Expense
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }





// works rn:   
// 'use client';

// import { useState } from 'react';
// import { z } from 'zod';

// // Zod schema for validation
// const expenseSchema = z.object({
//   title: z.string().min(1, 'Title is required'),
//   amount: z.number().positive('Amount must be positive'),
//   category: z.number(),
//   group: z.number(),
//   paid_by: z.number(),
//   split_type: z.enum(['equal', 'unequal', 'percentage', 'shares']),
//   participants: z
//     .array(
//       z.object({
//         user_id: z.number(),
//         amount: z.number().optional(),
//         percentage: z.number().optional(),
//         shares: z.number().optional(),
//       })
//     )
//     .min(1, 'At least one participant is required'),
// });

// export default function NewExpensePage() {
//   const [formData, setFormData] = useState({
//     title: '',
//     amount: '',
//     category: '',
//     group: '',
//     paid_by: '',
//     split_type: 'equal',
//     participants: [] as {
//       user_id: string;
//       amount?: string;
//       percentage?: string;
//       shares?: string;
//     }[],
//   });

//   // ✅ Generic form change handler
//   const handleChange = (field: string, value: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   // ✅ Participant change handler
//   const handleParticipantChange = (index: number, field: string, value: string) => {
//     const updated = [...formData.participants];
//     updated[index] = { ...updated[index], [field]: value };
//     setFormData((prev) => ({ ...prev, participants: updated }));
//   };

//   // ✅ Add new participant
//   const addParticipant = () => {
//     setFormData((prev) => ({
//       ...prev,
//       participants: [...prev.participants, { user_id: '' }],
//     }));
//   };

//   // ✅ Remove participant
//   const removeParticipant = (index: number) => {
//     setFormData((prev) => ({
//       ...prev,
//       participants: prev.participants.filter((_, i) => i !== index),
//     }));
//   };

//   // ✅ Submit handler
//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     const parsed = expenseSchema.safeParse({
//       ...formData,
//       amount: Number(formData.amount),
//       category: Number(formData.category),
//       group: Number(formData.group),
//       paid_by: Number(formData.paid_by),
//       participants: formData.participants.map((p) => ({
//         user_id: Number(p.user_id),
//         amount: p.amount ? Number(p.amount) : undefined,
//         percentage: p.percentage ? Number(p.percentage) : undefined,
//         shares: p.shares ? Number(p.shares) : undefined,
//       })),
//     });

//     if (!parsed.success) {
//       console.error(parsed.error.format());
//       alert('Please fix validation errors — see console for details.');
//       return;
//     }

//     console.log('Form submitted:', parsed.data);
//     alert('Expense saved successfully!');
//   };

//   return (
//     <div className="p-6 max-w-2xl mx-auto">
//       <h1 className="text-3xl font-bold mb-6">Add New Expense</h1>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         {/* Title */}
//         <input
//           type="text"
//           placeholder="Title"
//           value={formData.title}
//           onChange={(e) => handleChange('title', e.target.value)}
//           className="border p-2 rounded w-full"
//         />

//         {/* Amount */}
//         <input
//           type="number"
//           placeholder="Amount"
//           value={formData.amount}
//           onChange={(e) => handleChange('amount', e.target.value)}
//           className="border p-2 rounded w-full"
//         />

//         {/* Category */}
//         <input
//           type="number"
//           placeholder="Category ID"
//           value={formData.category}
//           onChange={(e) => handleChange('category', e.target.value)}
//           className="border p-2 rounded w-full"
//         />

//         {/* Group */}
//         <input
//           type="number"
//           placeholder="Group ID"
//           value={formData.group}
//           onChange={(e) => handleChange('group', e.target.value)}
//           className="border p-2 rounded w-full"
//         />

//         {/* Paid By */}
//         <input
//           type="number"
//           placeholder="Paid By (User ID)"
//           value={formData.paid_by}
//           onChange={(e) => handleChange('paid_by', e.target.value)}
//           className="border p-2 rounded w-full"
//         />

//         {/* Split Type */}
//         <select
//           value={formData.split_type}
//           onChange={(e) => handleChange('split_type', e.target.value)}
//           className="border p-2 rounded w-full"
//         >
//           <option value="equal">Equal</option>
//           <option value="unequal">Unequal</option>
//           <option value="percentage">Percentage</option>
//           <option value="shares">Shares</option>
//         </select>

//         {/* Participants */}
//         <div className="space-y-2">
//           <h2 className="text-lg font-semibold">Participants</h2>
//           {formData.participants.map((p, index) => (
//             <div key={index} className="flex gap-2 items-center">
//               <input
//                 type="number"
//                 placeholder="User ID"
//                 value={p.user_id}
//                 onChange={(e) => handleParticipantChange(index, 'user_id', e.target.value)}
//                 className="border p-2 rounded w-24"
//               />

//               {formData.split_type === 'unequal' && (
//                 <input
//                   type="number"
//                   placeholder="Amount"
//                   value={p.amount || ''}
//                   onChange={(e) => handleParticipantChange(index, 'amount', e.target.value)}
//                   className="border p-2 rounded w-24"
//                 />
//               )}

//               {formData.split_type === 'percentage' && (
//                 <input
//                   type="number"
//                   placeholder="%"
//                   value={p.percentage || ''}
//                   onChange={(e) => handleParticipantChange(index, 'percentage', e.target.value)}
//                   className="border p-2 rounded w-20"
//                 />
//               )}

//               {formData.split_type === 'shares' && (
//                 <input
//                   type="number"
//                   placeholder="Shares"
//                   value={p.shares || ''}
//                   onChange={(e) => handleParticipantChange(index, 'shares', e.target.value)}
//                   className="border p-2 rounded w-20"
//                 />
//               )}

//               <button
//                 type="button"
//                 onClick={() => removeParticipant(index)}
//                 className="text-red-500"
//               >
//                 ✕
//               </button>
//             </div>
//           ))}

//           <button
//             type="button"
//             onClick={addParticipant}
//             className="bg-green-500 text-white px-3 py-1 rounded"
//           >
//             + Add Participant
//           </button>
//         </div>

//         {/* Submit */}
//         <button
//           type="submit"
//           className="bg-blue-500 text-white px-4 py-2 rounded"
//         >
//           Save Expense
//         </button>
//       </form>
//     </div>
//   );
// }









// 'use client';

// import { useState, useEffect } from 'react';
// import { useForm, Controller, SubmitHandler, useFieldArray } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { makeRequest } from '@/lib/api';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Badge } from '@/components/ui/badge';

// export interface CreateExpenseData {
//   title: string;
//   amount: number;
//   category: number;
//   group: number;
//   paid_by: number;
//   split_type: 'equal' | 'unequal' | 'percentage' | 'shares';
//   participants: {
//     user_id: number;
//     amount?: number;
//     percentage?: number;
//     shares?: number;
//   }[];
// }

// const schema = z.object({
//   title: z.string().min(1, 'Title is required'),
//   amount: z.number().positive('Amount must be positive'),
//   category: z.number({
//     required_error: 'Category is required',
//     invalid_type_error: 'Category must be a number',
//   }),
//   group: z.number({
//     required_error: 'Group is required',
//     invalid_type_error: 'Group must be a number',
//   }),
//   paid_by: z.number({
//     required_error: 'Paid by is required',
//     invalid_type_error: 'Paid by must be a number',
//   }),
//   split_type: z.enum(['equal', 'unequal', 'percentage', 'shares']),
//   participants: z
//     .array(
//       z.object({
//         user_id: z.number(),
//         amount: z.number().optional(),
//         percentage: z.number().optional(),
//         shares: z.number().optional(),
//       })
//     )
//     .min(1, 'At least one participant is required'),
// });

// export default function CreateExpensePage() {
//   const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
//   const [groups, setGroups] = useState<{ id: number; name: string }[]>([]);
//   const [members, setMembers] = useState<{ id: number; name: string }[]>([]);
//   const [totalPercentage, setTotalPercentage] = useState(0);
//   const [totalShares, setTotalShares] = useState(0);

//   const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateExpenseData>({
//     resolver: zodResolver(schema),
//     defaultValues: {
//       title: '',
//       amount: 0,
//       category: 0,
//       group: 0,
//       paid_by: 0,
//       split_type: 'equal',
//       participants: [],
//     },
//   });

//   const { fields, replace } = useFieldArray({
//     control,
//     name: 'participants'
//   });

//   const groupId = watch('group');
//   const splitType = watch('split_type');
//   const totalAmount = watch('amount');
//   const participants = watch('participants');

//   // Calculate totals for validation
//   useEffect(() => {
//     if (splitType === 'percentage') {
//       const total = participants.reduce((sum, p) => sum + (p.percentage || 0), 0);
//       setTotalPercentage(total);
//     } else if (splitType === 'shares') {
//       const total = participants.reduce((sum, p) => sum + (p.shares || 0), 0);
//       setTotalShares(total);
//     }
//   }, [participants, splitType]);

//   useEffect(() => {
//     makeRequest('/categories').then((res) => setCategories(res.data || []));
//     makeRequest('/groups').then((res) => setGroups(res.data || []));
//   }, []);

//   useEffect(() => {
//     if (groupId) {
//       makeRequest(`/groups/${groupId}/members`).then((res) => {
//         setMembers(res.data || []);
//         const newParticipants = res.data.map((m: any) => ({
//           user_id: m.id,
//           ...(splitType === 'equal'
//             ? {}
//             : splitType === 'unequal'
//             ? { amount: 0 }
//             : splitType === 'percentage'
//             ? { percentage: 0 }
//             : { shares: 0 })
//         }));
//         replace(newParticipants);
//       });
//     }
//   }, [groupId, replace, splitType]);

//   // Auto-calculate equal splits
//   useEffect(() => {
//     if (splitType === 'equal' && participants.length > 0 && totalAmount > 0) {
//       const equalAmount = totalAmount / participants.length;
//       const updatedParticipants = participants.map(p => ({
//         ...p,
//         amount: Math.round(equalAmount * 100) / 100,
//         percentage: undefined,
//         shares: undefined
//       }));
//       replace(updatedParticipants);
//     } else if (splitType !== 'equal') {
//       const updatedParticipants = participants.map(p => ({
//         ...p,
//         ...(splitType === 'unequal' ? {} : { amount: undefined }),
//         ...(splitType === 'percentage' ? {} : { percentage: undefined }),
//         ...(splitType === 'shares' ? {} : { shares: undefined })
//       }));
//       replace(updatedParticipants);
//     }
//   }, [splitType, totalAmount, participants.length, replace]);

//   const onSubmit: SubmitHandler<CreateExpenseData> = async (data) => {
//     if (splitType === 'percentage' && Math.abs(totalPercentage - 100) > 0.01) {
//       alert('Percentages must add up to 100%');
//       return;
//     }

//     if (splitType === 'unequal') {
//       const totalUnequal = data.participants.reduce((sum, p) => sum + (p.amount || 0), 0);
//       if (Math.abs(totalUnequal - data.amount) > 0.01) {
//         alert(`Unequal amounts must add up to total expense amount (${data.amount})`);
//         return;
//       }
//     }

//     try {
//       await makeRequest('/expenses', {
//         method: 'POST',
//         body: JSON.stringify(data),
//       });
//       alert('Expense created successfully');
//     } catch (error) {
//       console.error('Error creating expense:', error);
//       alert('Failed to create expense');
//     }
//   };

//   const renderParticipantInput = (index: number, member: { id: number; name: string }) => {
//     switch (splitType) {
//       case 'equal':
//         const equalAmount = totalAmount > 0 ? totalAmount / participants.length : 0;
//         return <div className="text-sm text-gray-600">${(Math.round(equalAmount * 100) / 100).toFixed(2)}</div>;

//       case 'unequal':
//         return (
//           <Controller
//             name={`participants.${index}.amount`}
//             control={control}
//             render={({ field }) => (
//               <Input
//                 {...field}
//                 type="number"
//                 step="0.01"
//                 placeholder="Amount"
//                 className="w-24"
//                 onChange={(e) => field.onChange(Number(e.target.value) || 0)}
//               />
//             )}
//           />
//         );

//       case 'percentage':
//         return (
//           <div className="flex items-center gap-2">
//             <Controller
//               name={`participants.${index}.percentage`}
//               control={control}
//               render={({ field }) => (
//                 <Input
//                   {...field}
//                   type="number"
//                   step="0.01"
//                   max="100"
//                   placeholder="%"
//                   className="w-20"
//                   onChange={(e) => field.onChange(Number(e.target.value) || 0)}
//                 />
//               )}
//             />
//             <span className="text-sm text-gray-500">%</span>
//           </div>
//         );

//       case 'shares':
//         return (
//           <Controller
//             name={`participants.${index}.shares`}
//             control={control}
//             render={({ field }) => (
//               <Input
//                 {...field}
//                 type="number"
//                 min="0"
//                 placeholder="Shares"
//                 className="w-20"
//                 onChange={(e) => field.onChange(Number(e.target.value) || 0)}
//               />
//             )}
//           />
//         );

//       default:
//         return null;
//     }
//   };

//   const getSplitSummary = () => {
//     if (splitType === 'percentage' && totalPercentage !== 100) {
//       return <div className="text-sm text-red-600">Total: {totalPercentage.toFixed(1)}% (should be 100%)</div>;
//     }
//     if (splitType === 'unequal' && participants.length > 0) {
//       const totalUnequal = participants.reduce((sum, p) => sum + (p.amount || 0), 0);
//       const isValid = Math.abs(totalUnequal - totalAmount) < 0.01;
//       return (
//         <div className={`text-sm ${isValid ? 'text-green-600' : 'text-red-600'}`}>
//           Total: ${totalUnequal.toFixed(2)} / ${totalAmount.toFixed(2)}
//         </div>
//       );
//     }
//     if (splitType === 'shares' && totalShares > 0) {
//       return <div className="text-sm text-gray-600">Total shares: {totalShares}</div>;
//     }
//     return null;
//   };

//   return (
//     <div className="max-w-2xl mx-auto">
//       <h1 className="text-2xl font-bold mb-6">Create New Expense</h1>

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//         {/* Basic Info */}
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium mb-2">Title</label>
//             <Controller name="title" control={control} render={({ field }) => <Input {...field} placeholder="Expense title" />} />
//             {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>}
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-2">Amount</label>
//             <Controller
//               name="amount"
//               control={control}
//               render={({ field }) => (
//                 <Input {...field} type="number" step="0.01" onChange={(e) => field.onChange(Number(e.target.value) || 0)} placeholder="0.00" />
//               )}
//             />
//             {errors.amount && <p className="text-sm text-red-600 mt-1">{errors.amount.message}</p>}
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-2">Category</label>
//             <Controller
//               name="category"
//               control={control}
//               render={({ field }) => (
//                 <Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}>
//                   <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
//                   <SelectContent>
//                     {categories.map((cat) => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}
//                   </SelectContent>
//                 </Select>
//               )}
//             />
//             {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>}
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-2">Group</label>
//             <Controller
//               name="group"
//               control={control}
//               render={({ field }) => (
//                 <Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}>
//                   <SelectTrigger><SelectValue placeholder="Select group" /></SelectTrigger>
//                   <SelectContent>
//                     {groups.map((g) => <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>)}
//                   </SelectContent>
//                 </Select>
//               )}
//             />
//             {errors.group && <p className="text-sm text-red-600 mt-1">{errors.group.message}</p>}
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-2">Paid by</label>
//             <Controller
//               name="paid_by"
//               control={control}
//               render={({ field }) => (
//                 <Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}>
//                   <SelectTrigger><SelectValue placeholder="Select payer" /></SelectTrigger>
//                   <SelectContent>
//                     {members.map((m) => <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>)}
//                   </SelectContent>
//                 </Select>
//               )}
//             />
//             {errors.paid_by && <p className="text-sm text-red-600 mt-1">{errors.paid_by.message}</p>}
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-2">Split type</label>
//             <Controller
//               name="split_type"
//               control={control}
//               render={({ field }) => (
//                 <Select onValueChange={field.onChange} value={field.value}>
//                   <SelectTrigger><SelectValue placeholder="Select split type" /></SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="equal">Equal Split</SelectItem>
//                     <SelectItem value="unequal">Unequal Amounts</SelectItem>
//                     <SelectItem value="percentage">By Percentage</SelectItem>
//                     <SelectItem value="shares">By Shares</SelectItem>
//                   </SelectContent>
//                 </Select>
//               )}
//             />
//           </div>
//         </div>

//         {/* Participants */}
//         {members.length > 0 && (
//           <div className="space-y-4">
//             <div className="flex items-center justify-between">
//               <h3 className="text-lg font-medium">Split Details</h3>
//               {getSplitSummary()}
//             </div>

//             <div className="space-y-3">
//               {fields.map((field, index) => {
//                 const member = members.find(m => m.id === field.user_id);
//                 if (!member) return null;
//                 return (
//                   <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg">
//                     <div className="flex items-center gap-3">
//                       <Badge variant="secondary">{member.name}</Badge>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       {renderParticipantInput(index, member)}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>

//             {splitType === 'equal' && totalAmount > 0 && (
//               <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
//                 Each person pays: ${(totalAmount / participants.length).toFixed(2)}
//               </div>
//             )}
//           </div>
//         )}

//         <Button
//           type="submit"
//           className="w-full"
//           disabled={
//             (splitType === 'percentage' && Math.abs(totalPercentage - 100) > 0.01) ||
//             (splitType === 'unequal' && participants.length > 0 &&
//               Math.abs(participants.reduce((sum, p) => sum + (p.amount || 0), 0) - totalAmount) > 0.01)
//           }
//         >
//           Create Expense
//         </Button>
//       </form>
//     </div>
//   );
// }

