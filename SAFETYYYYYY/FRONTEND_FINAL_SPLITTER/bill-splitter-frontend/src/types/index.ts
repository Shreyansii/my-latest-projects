
// ==== User Types ====
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  is_verified: boolean;
  created_at: string;
  display_name?: string; // From serializer method field
}

export interface UserDisplay {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  is_verified: boolean;
}

// ==== Auth Types ====
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  message: string;
}

export interface AuthError {
  error: string;
  code?: string; // For EMAIL_NOT_VERIFIED case
}

// ==== Settings Types ====
export interface Settings {
  id: number;
  user: number;
  currency: string;
  timezone: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  // Add other settings fields as needed
}

// ==== Group Types ====
export interface GroupMember {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  members: GroupMember[];
  created_by: User;
  created_at: string;
  updated_at: string;
}

// ==== Category Types ====
export interface Category {
  id: number;
  name: string;
  color: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

// ==== Expense Participant Types ====
export interface ExpenseParticipant {
  user_id: number;
  user_name: string;
  user_email: string;
  amount: number;
  percentage?: number;
  shares?: number;
}

// ==== Expense Types ====
export interface ExpenseList {
  id: number;
  title: string;
  description?: string;
  amount: number;
  split_type: 'equal' | 'unequal' | 'percentage' | 'shares';
  date: string;
  created_by_name: string;
  paid_by_name: string;
  group_name: string;
  category_detail?: Category;
  participant_count: number;
  created_at: string;
}

export interface ExpenseDetail {
  id: number;
  title: string;
  description?: string;
  amount: number;
  split_type: 'equal' | 'unequal' | 'percentage' | 'shares';
  date: string;
  created_by_name: string;
  paid_by_name: string;
  group_name: string;
  category_detail?: Category;
  participants: ExpenseParticipant[];
  created_at: string;
  updated_at: string;
}

// Main Expense type for listing (aliased to ExpenseList)
export type Expense = ExpenseList;

// ==== Create Expense Data ====
export interface CreateExpenseData {
  group: number;
  paid_by: number;
  title: string;
  description?: string;
  amount: number;
  split_type: 'equal' | 'unequal' | 'percentage' | 'shares';
  category?: number | null;
  date: string;
  participants: Array<{
    user_id: number;
    amount?: number;
    percentage?: number;
    shares?: number;
  }>;
}

// ==== Activity Log Types ====
export interface ActivityLog {
  id: number;
  user: User;
  group: Group;
  action: string;
  action_type: string;
  ref_table?: string;
  ref_obj?: string;
  ref_id?: number;
  timestamp: string;
}

// ==== Settlement Types ====
export interface Settlement {
  id: number;
  from_user: User;
  to_user: User;
  amount: number;
  group: Group;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Balance {
  user: User;
  paid: number;
  owes: number;
  net_balance: number;
}

export interface SettlementSuggestion {
  from_user_id: number;
  from_user: User;
  to_user_id: number;
  to_user: User;
  amount: number;
}

export interface UserExpenseBreakdown {
  paid_count: number;
  paid_total: number;
  participated_count: number;
  owed_total: number;
  paid_expenses: Expense[];
  participated_expenses: ExpenseParticipant[];
}



// // =======================
// // User related types
// // =======================
// export interface User {
//   id: number;
//   email: string;
//   first_name: string;
//   last_name: string;
//   username?: string;
//   is_active?: boolean;
//   created_at?: string;
//   updated_at?: string;
//   date_joined?: string;
// }

// export interface AuthResponse {
//   access: string;
//   refresh: string;
//   user: User;
// }

// export interface RegisterData {
//   email: string;
//   password: string;
//   first_name: string;
//   last_name: string;
// }

// // =======================
// // Group related types
// // =======================
// export interface Group {
//   id: number;
//   name: string;
//   description?: string;
//   members: GroupMember[];
//   created_by: User;
//   created_at: string;
//   updated_at: string;
// }

// export interface GroupMember {
//   id: number;
//   first_name: string;
//   last_name: string;
//   email: string;
//   username?: string;
// }

// // =======================
// // Category related types
// // =======================
// export interface Category {
//   id: number;
//   name: string;
//   color?: string;
//   icon?: string;
//   created_at?: string;
//   updated_at?: string;
// }

// // =======================
// // Expense related types
// // =======================
// export type SplitType = 'equal' | 'unequal' | 'percentage' | 'shares';

// export interface ExpenseParticipant {
//   user_id: number;
//   user_name: string;
//   user_email: string;
//   amount: number;
//   percentage?: number;
//   shares?: number;
// }

// export interface Expense {
//   id: number;
//   title: string;
//   description?: string;
//   amount: number;
//   split_type?: SplitType;
//   date?: string;
//   category?: Category;
//   category_detail?: Category;
//   created_by: User;
//   created_by_name?: string;
//   paid_by?: User;
//   paid_by_name?: string;
//   group?: Group;
//   group_name?: string;
//   participants?: ExpenseParticipant[] | User[];
//   participant_count?: number;
//   created_at: string;
//   updated_at: string;
// }

// export interface CreateExpenseData {
//   group: number;
//   paid_by: number;
//   title: string;
//   description?: string;
//   amount: number;
//   split_type: SplitType;
//   category: undefined // instead of null

//   date: string;
//   participants: Array<{
//     user_id: number;
//     amount?: number;
//     percentage?: number;
//     shares?: number;
//   }>;
// }

// // =======================
// // Balance & Settlement types
// // =======================
// export interface Balance {
//   user: User;
//   amount?: number;
//   owes?: boolean;
//   paid?: number;
//   owes_amount?: number;
//   net_balance?: number;
// }

// export interface Settlement {
//   id: number;
//   from_user: User;
//   to_user: User;
//   amount: number;
//   group: Group;
//   status: 'pending' | 'completed' | 'cancelled';
//   created_at: string;
//   updated_at: string;
// }

// export interface SettlementSuggestion {
//   from_user_id: number;
//   from_user: User;
//   to_user_id: number;
//   to_user: User;
//   amount: number;
// }

// export interface UserExpenseBreakdown {
//   paid_count: number;
//   paid_total: number;
//   participated_count: number;
//   owed_total: number;
//   paid_expenses: Expense[];
//   participated_expenses: ExpenseParticipant[];
// }

// // =======================
// // Activity related types
// // =======================
// export interface ActivityLog {
//   id: number;
//   user: User;
//   group?: Group;
//   action: string;
//   action_type?: string;
//   expense?: Expense;
//   ref_table?: string;
//   ref_obj?: string;
//   ref_id?: number;
//   timestamp: string;
// }

// // =======================
// // API Error type
// // =======================
// export interface ApiError {
//   message: string;
//   field?: string;
// }

// // =======================
// // Form types
// // =======================
// export interface LoginFormData {
//   email: string;
//   password: string;
// }

// export interface ExpenseFormData {
//   title: string;
//   description?: string;
//   amount: number;
//   category: number;
//   participants: number[];
// }




// // User related types
// export interface User {
//   id: number;
//   email: string;
//   first_name: string;
//   last_name: string;
//   is_active: boolean;
//   date_joined: string;
// }

// export interface AuthResponse {
//   access: string;
//   refresh: string;
//   user: User;
// }

// export interface RegisterData {
//   email: string;
//   password: string;
//   first_name: string;
//   last_name: string;
// }

// // Expense related types
// export interface Category {
//   id: number;
//   name: string;
//   icon?: string;
// }

// export interface Expense {
//   id: number;
//   title: string;
//   description?: string;
//   amount: number;
//   category: Category;
//   created_by: User;
//   participants: User[];
//   created_at: string;
//   updated_at: string;
// }

// export interface Balance {
//   user: User;
//   amount: number;
//   owes: boolean;
// }

// // Activity related types
// export interface ActivityLog {
//   id: number;
//   action: string;
//   expense?: Expense;
//   user: User;
//   timestamp: string;
// }

// // API Error type
// export interface ApiError {
//   message: string;
//   field?: string;
// }

// // Form types
// export interface LoginFormData {
//   email: string;
//   password: string;
// }

// export interface ExpenseFormData {
//   title: string;
//   description?: string;
//   amount: number;
//   category: number;
//   participants: number[];
// }
