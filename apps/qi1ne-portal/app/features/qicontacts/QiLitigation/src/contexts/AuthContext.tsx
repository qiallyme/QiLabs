import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'master' | 'admin' | 'partner' | 'attorney' | 'paralegal';
  lawFirmId?: string;
  lawFirmName?: string;
  permissions?: string[];
  selectedFirmId?: string; // For master account to switch between firms
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing Supabase session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Get user profile from database
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          const supabaseUser: User = {
            userId: profile.id,
            email: profile.email,
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            role: profile.role,
            lawFirmId: profile.law_firm_id,
            lawFirmName: profile.law_firm_name,
            permissions: profile.permissions
          };
          setUser(supabaseUser);
        }
      } else {
        // Check for demo user in localStorage
        const savedUser = localStorage.getItem('demoUser');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        localStorage.removeItem('demoUser');
      } else if (session?.user) {
        // Refresh user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          const supabaseUser: User = {
            userId: profile.id,
            email: profile.email,
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            role: profile.role,
            lawFirmId: profile.law_firm_id,
            lawFirmName: profile.law_firm_name,
            permissions: profile.permissions
          };
          setUser(supabaseUser);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Try Supabase authentication first
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // If Supabase auth fails, try demo accounts
        const demoAccounts = [
          {
            email: 'master@unfy.com',
            password: 'EMunfy2025',
            user: {
              userId: 'master-001',
              email: 'master@unfy.com',
              firstName: 'System',
              lastName: 'Administrator',
              role: 'master' as const,
              permissions: ['*']
            }
          },
          {
            email: 'admin@lawfirm.com',
            password: 'admin123',
            user: {
              userId: 'admin-001',
              email: 'admin@lawfirm.com',
              firstName: 'Robert',
              lastName: 'Blake',
              role: 'admin' as const,
              lawFirmId: 'firm-001',
              lawFirmName: 'Blake & Associates'
            }
          },
          {
            email: 'partner@lawfirm.com',
            password: 'partner123',
            user: {
              userId: 'partner-001',
              email: 'partner@lawfirm.com',
              firstName: 'John',
              lastName: 'Davidson',
              role: 'partner' as const,
              lawFirmId: 'firm-001',
              lawFirmName: 'Blake & Associates'
            }
          },
          {
            email: 'attorney@lawfirm.com',
            password: 'attorney123',
            user: {
              userId: 'attorney-001',
              email: 'attorney@lawfirm.com',
              firstName: 'Sarah',
              lastName: 'Mitchell',
              role: 'attorney' as const,
              lawFirmId: 'firm-001',
              lawFirmName: 'Blake & Associates'
            }
          },
          {
            email: 'paralegal@lawfirm.com',
            password: 'paralegal123',
            user: {
              userId: 'paralegal-001',
              email: 'paralegal@lawfirm.com',
              firstName: 'Emily',
              lastName: 'Chen',
              role: 'paralegal' as const,
              lawFirmId: 'firm-001',
              lawFirmName: 'Blake & Associates'
            }
          }
        ];

        const demoAccount = demoAccounts.find(acc => acc.email === email && acc.password === password);
        if (demoAccount) {
          console.log('Demo login successful:', demoAccount.user);
          setUser(demoAccount.user);
          localStorage.setItem('demoUser', JSON.stringify(demoAccount.user));
          return;
        }

        throw new Error('Invalid email or password');
      }

      // If Supabase auth succeeds, get user profile
      if (authData.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          // Create a basic user object if profile doesn't exist
          const basicUser: User = {
            userId: authData.user.id,
            email: authData.user.email || '',
            firstName: authData.user.user_metadata?.first_name || '',
            lastName: authData.user.user_metadata?.last_name || '',
            role: 'paralegal'
          };
          setUser(basicUser);
        } else {
          const supabaseUser: User = {
            userId: profile.id,
            email: profile.email,
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            role: profile.role,
            lawFirmId: profile.law_firm_id,
            lawFirmName: profile.law_firm_name,
            permissions: profile.permissions
          };
          setUser(supabaseUser);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('demoUser');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};