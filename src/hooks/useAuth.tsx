import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AdminUser {
  email: string;
}

interface AuthContext {
  user: AdminUser | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContext | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminRole = async (supaUser: User) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', supaUser.id)
      .eq('role', 'admin')
      .maybeSingle();
    return !!data;
  };

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const admin = await checkAdminRole(session.user);
        setUser({ email: session.user.email || '' });
        setIsAdmin(admin);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const admin = await checkAdminRole(session.user);
        setUser({ email: session.user.email || '' });
        setIsAdmin(admin);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      return { error: error.message };
    }
    if (data.user) {
      const admin = await checkAdminRole(data.user);
      if (!admin) {
        await supabase.auth.signOut();
        return { error: "Not authorized. Only admin accounts can access this area." };
      }
      setUser({ email: data.user.email || '' });
      setIsAdmin(true);
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (newPassword.length < 6) {
      return { error: "New password must be at least 6 characters" };
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signIn, signOut, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
