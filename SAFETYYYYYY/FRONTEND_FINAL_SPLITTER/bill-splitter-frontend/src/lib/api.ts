// import {
//   User,
//   Expense,
//   ExpenseDetail,
//   ActivityLog,
//   CreateExpenseData,
//   Group,
//   Category,
//   RegisterData,
// } from '@/types';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// interface ApiResponse<T = any> {
//   data?: T;
//   message?: string;
//   error?: string;
// }

// // ==== Request Helper ====
// export async function makeRequest<T = any>(
//   endpoint: string,
//   options: RequestInit = {},
//   skipAuth = false
// ): Promise<ApiResponse<T>> {
//   const url = `${API_BASE_URL}${endpoint}`;

//   const defaultHeaders: HeadersInit = {
//     'Content-Type': 'application/json',
//     Accept: 'application/json',
//   };

//   const config: RequestInit = {
//     ...options,
//     headers: {
//       ...defaultHeaders,
//       ...options.headers,
//     },
//     credentials: 'include',
//   };

//   try {
//     const response = await fetch(url, config);

//     if (!response.ok) {
//       let data: any = null;
//       const contentType = response.headers.get('content-type');
//       if (contentType?.includes('application/json')) {
//         data = await response.json();
//       } else {
//         data = await response.text();
//       }

//       const error = new Error(
//         data?.detail || data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`
//       );
//       (error as any).status = response.status;
//       throw error;
//     }

//     const contentType = response.headers.get('content-type');
//     if (contentType?.includes('application/json')) {
//       const data = await response.json();
//       return { data };
//     }

//     return { data: undefined };
//   } catch (error) {
//     console.error('API Request Error:', error);
//     throw error;
//   }
// }

// // ==== User API ====
// async function register(userData: RegisterData) {
//   return makeRequest('/api/auth/users/', {
//     method: 'POST',
//     body: JSON.stringify(userData),
//   }, true);
// }

// async function login(email: string, password: string) {
//   return makeRequest('/api/auth/users/login/', {
//     method: 'POST',
//     body: JSON.stringify({ email, password }),
//   }, true);
// }

// // FIXED: The apiClient no longer handles redirection. It just makes the API call.
// async function logout() {
//   try {
//     await makeRequest('/api/auth/users/logout/', { method: 'POST' });
//   } catch (error) {
//     console.warn('Logout API error:', error);
//   }
// }

// async function getCurrentUser(): Promise<User | null> {
//   try {
//     const res = await makeRequest<User>('/api/auth/users/me/', { method: 'GET' });
//     return res.data || null;
//   } catch (error) {
//     return null;
//   }
// }

// async function verifyEmail(token: string) {
//   return makeRequest('/api/auth/users/verify_email/', {
//     method: 'POST',
//     body: JSON.stringify({ token }),
//   }, true);
// }

// async function forgotPassword(email: string) {
//   return makeRequest('/api/auth/users/reset_password/', {
//     method: 'POST',
//     body: JSON.stringify({ email }),
//   }, true);
// }

// async function resetPassword(token: string, password: string, confirmPassword: string) {
//   return makeRequest('/api/auth/users/reset_password_confirm/', {
//     method: 'POST',
//     body: JSON.stringify({ token, password, password_confirm: confirmPassword }),
//   }, true);
// }

// // ==== Groups & Categories ====
// async function getGroups(): Promise<Group[]> {
//   const res = await makeRequest<Group[]>('/api/groups/', { method: 'GET' });
//   return res.data || [];
// }

// async function getCategories(): Promise<Category[]> {
//   const res = await makeRequest<Category[]>('/api/categories/', { method: 'GET' });
//   return res.data || [];
// }

// // ==== Expenses ====
// async function getExpenses(): Promise<Expense[]> {
//   const res = await makeRequest<Expense[]>('/api/expenses/', { method: 'GET' });
//   return res.data || [];
// }

// async function createExpense(data: CreateExpenseData) {
//   return makeRequest('/api/expenses/', {
//     method: 'POST',
//     body: JSON.stringify(data),
//   });
// }

// async function getExpense(id: number): Promise<ExpenseDetail> {
//   const res = await makeRequest<ExpenseDetail>(`/api/expenses/${id}/`, { method: 'GET' });
//   if (!res.data) {
//     throw new Error('Expense not found');
//   }
//   return res.data;
// }

// async function updateExpense(id: number, data: Partial<CreateExpenseData>) {
//   return makeRequest(`/api/expenses/${id}/`, {
//     method: 'PATCH',
//     body: JSON.stringify(data),
//   });
// }

// async function deleteExpense(id: number) {
//   return makeRequest(`/api/expenses/${id}/`, { method: 'DELETE' });
// }

// // ==== Activity Logs ====
// async function getActivityLogs(): Promise<ActivityLog[]> {
//   const res = await makeRequest<ActivityLog[]>('/api/activities/', { method: 'GET' });
//   return res.data || [];
// }

// // ==== Export API Client ====
// export const apiClient = {
//   // User
//   register,
//   login,
//   logout,
//   getCurrentUser,
//   verifyEmail,
//   forgotPassword,
//   resetPassword,

//   // Groups & Categories
//   getGroups,
//   getCategories,

//   // Expenses
//   getExpenses,
//   createExpense,
//   getExpense,
//   updateExpense,
//   deleteExpense,

//   // Activities
//   getActivityLogs,
// };



// src/lib/api.ts

import {
  User,
  Expense,
  ExpenseDetail,
  ActivityLog,
  CreateExpenseData,
  Group,
  Category,
  RegisterData,
} from '@/types';

interface CreateGroupData {
  name: string;
  description?: string;
  group_avatar_url?: string;
  currency?: string;
}

interface InviteCreateData {
  group: number;
  emails: string[];
}

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


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function makeRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  skipAuth = false
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log('Making API request:', url, options.method);

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include',
  };

  if (!skipAuth && typeof window !== 'undefined') {
    // FIX: Look for 'access_token' cookie, not 'access'
    const accessToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('access_token='))
      ?.split('=')[1];

    if (accessToken) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${accessToken}`,
      };
    }
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let data: any = null;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      const error = new Error(
        data?.detail || data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`
      );
      (error as any).status = response.status;
      throw error;
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return data;
    }

    return undefined as T;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

// ==== User API ====
async function register(userData: RegisterData) {
  return makeRequest('/api/auth/users/', {
    method: 'POST',
    body: JSON.stringify(userData),
  }, true);
}

// FIX: Corrected the login URL to match your Django URL patterns
async function login(email: string, password: string) {
  return makeRequest('/api/auth/users/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }, true);
}

async function logout() {
  try {
    // Note: Logout logic should typically happen on the backend
    // to invalidate the token, but for now we'll just redirect.
  } catch (error) {
    console.warn('Logout API error:', error);
  } finally {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
}

async function getCurrentUser(): Promise<User | null> {
  try {
    const res = await makeRequest<User>('/api/auth/users/me/', { method: 'GET' });
    return res || null;
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    return null;
  }
}

async function verifyEmail(token: string) {
  return makeRequest('/api/auth/users/verify_email/', {
    method: 'POST',
    body: JSON.stringify({ token }),
  }, true);
}

async function forgotPassword(email: string) {
  return makeRequest('/api/auth/users/reset_password/', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }, true);
}

async function resetPassword(token: string, password: string, confirmPassword: string) {
  return makeRequest('/api/auth/users/reset_password_confirm/', {
    method: 'POST',
    body: JSON.stringify({ token, password, password_confirm: confirmPassword }),
  }, true);
}


// ==== Groups & Categories API ====
async function getGroups(): Promise<Group[]> {
  // FIX: Handle paginated response and return the 'results' array
  const res = await makeRequest<any>('/api/groups/', { method: 'GET' });
  return res.results || [];
}


async function getGroup(id: string): Promise<GroupDetail> {
  const res = await makeRequest<GroupDetail>(`/api/groups/${id}/`, { method: 'GET' });
  if (!res) {
    throw new Error('Group not found');
  }
  return res;
}


async function getCategories(): Promise<Category[]> {
  // FIX: Handle paginated response and return the 'results' array
  const res = await makeRequest<any>('/api/categories/', { method: 'GET' });
  return res.results || [];
}

async function createGroup(data: CreateGroupData) {
  return makeRequest<Group>('/api/groups/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

async function createGroupInvites(data: InviteCreateData) {
  return makeRequest(`/api/groups/${data.group}/invite/`, {
    method: 'POST',
    body: JSON.stringify({ emails: data.emails }),
  });
}

// ==== Members API ====
async function getGroupMembers(groupId: string): Promise<{ members: GroupMember[] }> {
    // Assuming a dedicated endpoint for members
    return makeRequest<{ members: GroupMember[] }>(`/api/groups/${groupId}/members/`, {
        method: 'GET',
    });
}

async function removeGroupMember(groupId: string, memberId: string) {
  return makeRequest(`/api/groups/${groupId}/members/${memberId}/`, {
    method: 'DELETE',
  });
}

// ==== Expenses API ====
async function getExpenses(): Promise<Expense[]> {
  // FIX: Handle paginated response and return the 'results' array
  const res = await makeRequest<any>('/api/expenses/', { method: 'GET' });
  return res.results || [];
}

async function createExpense(data: CreateExpenseData) {
  return makeRequest('/api/expenses/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

async function getExpense(id: number): Promise<ExpenseDetail> {
  const res = await makeRequest<ExpenseDetail>(`/api/expenses/${id}/`, { method: 'GET' });
  if (!res) {
    throw new Error('Expense not found');
  }
  return res;
}

async function updateExpense(id: number, data: Partial<CreateExpenseData>) {
  return makeRequest(`/api/expenses/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

async function deleteExpense(id: number) {
  return makeRequest(`/api/expenses/${id}/`, { method: 'DELETE' });
}

// ==== Activity Logs API ====
async function getActivityLogs(): Promise<ActivityLog[]> {
  // FIX: Handle paginated response and return the 'results' array
  const res = await makeRequest<any>('/api/activities/', { method: 'GET' });
  return res.results || [];
}

// ==== Export API Client ====
export const apiClient = {
  // User
  register,
  login,
  logout,
  getCurrentUser,
  verifyEmail,
  forgotPassword,
  resetPassword,

  // Groups & Categories
  getGroups,
  getGroup,
  getCategories,
  createGroup,
  createGroupInvites,
  getGroupMembers, // Added getGroupMembers
  removeGroupMember, // ADDED THIS FUNCTION

  // Expenses
  getExpenses,
  createExpense,
  getExpense,
  updateExpense,
  deleteExpense,

  // Activities
  getActivityLogs,
};




