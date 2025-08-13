// 'use client';

// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   useCallback,
//   ReactNode,
// } from 'react';
// import { useRouter } from 'next/navigation';
// import { User, RegisterData } from '@/types';
// import { apiClient } from '@/lib/api';

// export interface AuthContextType {
//   user: User | null;
//   loading: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   register: (userData: RegisterData) => Promise<{ requiresVerification: boolean }>;
//   logout: () => Promise<void>;
//   isAuthenticated: boolean;
//   verifyEmail: (token: string) => Promise<void>;
//   forgotPassword: (email: string) => Promise<void>;
//   resetPassword: (token: string, password: string, confirmPassword: string) => Promise<void>;
// }

// export const AuthContext = createContext<AuthContextType | null>(null);

// interface AuthProviderProps {
//   children: ReactNode;
// }

// export function AuthProvider({ children }: AuthProviderProps) {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const router = useRouter();

//   const isAuthenticated = !!user;

//   const checkAuth = useCallback(async () => {
//     setLoading(true);
//     try {
//       const currentUser = await apiClient.getCurrentUser();
//       setUser(currentUser);
//     } catch (err) {
//       console.error('Error fetching current user:', err);
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     checkAuth();
//   }, [checkAuth]);

//   const login = useCallback(
//     async (email: string, password: string) => {
//       setLoading(true);
//       try {
//         await apiClient.login(email, password);
        
//         const currentUser = await apiClient.getCurrentUser();
//         setUser(currentUser);
        
//         router.push('/dashboard');
//       } catch (err: any) {
//         console.error('Login failed:', err);
//         setUser(null);
        
//         if (err.data?.code === 'EMAIL_NOT_VERIFIED') {
//           throw new Error('Please verify your email before logging in.');
//         }
        
//         throw err;
//       } finally {
//         setLoading(false);
//       }
//     },
//     [router]
//   );

//   const register = useCallback(
//     async (userData: RegisterData): Promise<{ requiresVerification: boolean }> => {
//       setLoading(true);
//       try {
//         await apiClient.register(userData);
//         return { requiresVerification: true };
//       } catch (err) {
//         console.error('Registration failed:', err);
//         setUser(null);
//         throw err;
//       } finally {
//         setLoading(false);
//       }
//     },
//     []
//   );

//   // FIXED: The logout function now handles all logout logic:
//   // - Call the API
//   // - Clear the local state
//   // - Redirect the user
//   const logout = useCallback(async () => {
//     setLoading(true);
//     try {
//       await apiClient.logout();
//     } catch (err) {
//       console.error('Logout failed:', err);
//     } finally {
//       setUser(null);
//       setLoading(false);
//       router.push('/login');
//     }
//   }, [router]);

//   const verifyEmail = useCallback(async (token: string) => {
//     setLoading(true);
//     try {
//       await apiClient.verifyEmail(token);
//       router.push('/login?verified=true');
//     } catch (err) {
//       console.error('Email verification failed:', err);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, [router]);

//   const forgotPassword = useCallback(async (email: string) => {
//     setLoading(true);
//     try {
//       await apiClient.forgotPassword(email);
//     } catch (err) {
//       console.error('Forgot password failed:', err);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const resetPassword = useCallback(async (
//     token: string, 
//     password: string, 
//     confirmPassword: string
//   ) => {
//     setLoading(true);
//     try {
//       await apiClient.resetPassword(token, password, confirmPassword);
//       router.push('/login?reset=true');
//     } catch (err) {
//       console.error('Password reset failed:', err);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, [router]);

//   const contextValue: AuthContextType = {
//     user,
//     loading,
//     login,
//     register,
//     logout,
//     isAuthenticated,
//     verifyEmail,
//     forgotPassword,
//     resetPassword,
//   };

//   return (
//     <AuthContext.Provider value={contextValue}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth(): AuthContextType {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }


'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { User, RegisterData } from '@/types';
import { apiClient } from '@/lib/api';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<{ requiresVerification: boolean }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  verifyEmail: (token: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // With an HTTP-only cookie, isAuthenticated is simply a check if a user is in state.
  // The only way to know for sure is to try and fetch the user.
  const isAuthenticated = !!user;

  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      // With HTTP-only cookies, the browser automatically sends the cookie.
      // We simply try to get the current user. If it succeeds, the cookie was valid.
      const currentUser = await apiClient.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error('Error fetching current user:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // On mount, check the authentication status.
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        await apiClient.login(email, password);
        
        // After a successful login, the cookie is set.
        // We now fetch the current user to update the state.
        const currentUser = await apiClient.getCurrentUser();
        setUser(currentUser);
        
        router.push('/dashboard');
      } catch (err: any) {
        console.error('Login failed:', err);
        setUser(null);
        
        if (err.data?.code === 'EMAIL_NOT_VERIFIED') {
          throw new Error('Please verify your email before logging in.');
        }
        
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const register = useCallback(
    async (userData: RegisterData): Promise<{ requiresVerification: boolean }> => {
      setLoading(true);
      try {
        await apiClient.register(userData);
        return { requiresVerification: true };
      } catch (err) {
        console.error('Registration failed:', err);
        setUser(null);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await apiClient.logout();
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      // Always clear the user state on logout.
      setUser(null);
      setLoading(false);
      router.push('/login');
    }
  }, [router]);

  const verifyEmail = useCallback(async (token: string) => {
    setLoading(true);
    try {
      await apiClient.verifyEmail(token);
      router.push('/login?verified=true');
    } catch (err) {
      console.error('Email verification failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const forgotPassword = useCallback(async (email: string) => {
    setLoading(true);
    try {
      await apiClient.forgotPassword(email);
    } catch (err) {
      console.error('Forgot password failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (
    token: string, 
    password: string, 
    confirmPassword: string
  ) => {
    setLoading(true);
    try {
      await apiClient.resetPassword(token, password, confirmPassword);
      router.push('/login?reset=true');
    } catch (err) {
      console.error('Password reset failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    verifyEmail,
    forgotPassword,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}





// 'use client';

// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   useCallback,
//   ReactNode,
//   ReactElement,
// } from 'react';
// import { useRouter } from 'next/navigation';
// import { apiClient, User } from '../lib/api';

// export interface RegisterData {
//   username?: string;
//   email: string;
//   password: string;
//   password_confirm?: string;
//   first_name: string;
//   last_name: string;
// }

// export interface AuthContextType {
//   user: User | null;
//   loading: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   register: (userData: RegisterData) => Promise<void>;
//   logout: () => Promise<void>;
//   isAuthenticated: boolean;
//   checkAuth: () => Promise<void>;
// }

// export const AuthContext = createContext<AuthContextType | null>(null);

// interface AuthProviderProps {
//   children: ReactNode;
// }

// export function AuthProvider({ children }: AuthProviderProps): ReactElement {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const router = useRouter();

//   const isAuthenticated = !!user;

//   const checkAuth = useCallback(async () => {
//     try {
//       const currentUser = await apiClient.getCurrentUser();
//       setUser(currentUser);
//     } catch (err) {
//       console.error('Error fetching current user:', err);
//       setUser(null);
//     }
//   }, []);

//   useEffect(() => {
//     const initAuth = async () => {
//       setLoading(true);
//       await checkAuth();
//       setLoading(false);
//     };
//     initAuth();
//   }, [checkAuth]);

//   const login = useCallback(
//     async (email: string, password: string) => {
//       setLoading(true);
//       try {
//         await apiClient.login(email, password);
//         const currentUser = await apiClient.getCurrentUser();
//         setUser(currentUser);
//         // Removed router.push('/dashboard')
//       } catch (err) {
//         console.error('Login failed:', err);
//         setUser(null);
//         throw err;
//       } finally {
//         setLoading(false);
//       }
//     },
//     []
//   );

//   const register = useCallback(
//     async (userData: RegisterData) => {
//       setLoading(true);
//       try {
//         const payload = {
//           username: userData.username || userData.email.split('@')[0],
//           email: userData.email,
//           password: userData.password,
//           password_confirm: userData.password_confirm || userData.password,
//           first_name: userData.first_name,
//           last_name: userData.last_name,
//         };

//         await apiClient.register(payload);
//         await apiClient.login(userData.email, userData.password);
//         const currentUser = await apiClient.getCurrentUser();
//         setUser(currentUser);
//         // Removed router.push('/dashboard')
//       } catch (err) {
//         console.error('Registration failed:', err);
//         setUser(null);
//         throw err;
//       } finally {
//         setLoading(false);
//       }
//     },
//     []
//   );

//   const logout = useCallback(async () => {
//     setLoading(true);
//     try {
//       await apiClient.logout();
//     } catch (err) {
//       console.error('Logout failed:', err);
//     } finally {
//       setUser(null);
//       setLoading(false);
//       router.push('/login');
//     }
//   }, [router]);

//   const contextValue: AuthContextType = {
//     user,
//     loading,
//     login,
//     register,
//     logout,
//     isAuthenticated,
//     checkAuth,
//   };

//   return (
//     <AuthContext.Provider value={contextValue}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth(): AuthContextType {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }
