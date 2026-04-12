import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface Profile {
  id: string;
  role: 'user' | 'admin';
  full_name: string | null;
  avatar_url: string | null;
  metadata: any;
}

export interface AppModule {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  description: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  modules: AppModule[];
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [modules, setModules] = useState<AppModule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfileAndModules = async (userId: string) => {
    try {
      // 1. Fetch Profile
      const { data: profileData, error: profileErr } = await supabase
        .from('qione.profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileErr) {
        console.warn('Failed to fetch profile:', profileErr);
        setProfile(null);
      } else {
        setProfile(profileData as Profile);
      }

      // 2. Fetch Modules via RPC
      const { data: moduleData, error: moduleErr } = await supabase
        .rpc('get_user_modules', { p_user_id: userId });

      if (moduleErr) {
        console.warn('Failed to fetch modules:', moduleErr);
        setModules([]);
      } else {
        setModules(moduleData as AppModule[]);
      }
    } catch (err) {
      console.error('Error in fetchProfileAndModules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfileAndModules(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfileAndModules(session.user.id);
      } else {
        setProfile(null);
        setModules([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setProfile(null);
    setModules([]);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfileAndModules(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        modules,
        loading,
        signOut: handleSignOut,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
