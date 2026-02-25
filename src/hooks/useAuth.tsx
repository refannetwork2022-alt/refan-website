import { useState, useEffect, createContext, useContext, ReactNode } from "react";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "";
const DEFAULT_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "";
const SESSION_KEY = "refan_admin_session";
const PASSWORD_KEY = "refan_admin_password";

function getPassword() {
  return localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;
}

interface AdminUser {
  email: string;
}

interface AuthContext {
  user: AdminUser | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => { error: string | null };
}

const AuthContext = createContext<AuthContext | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    if (
      email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim() &&
      password === getPassword()
    ) {
      const adminUser = { email: email.toLowerCase().trim() };
      setUser(adminUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(adminUser));
      return { error: null };
    }
    return { error: "Invalid login credentials" };
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const changePassword = (currentPassword: string, newPassword: string) => {
    if (currentPassword !== getPassword()) {
      return { error: "Current password is incorrect" };
    }
    if (newPassword.length < 6) {
      return { error: "New password must be at least 6 characters" };
    }
    localStorage.setItem(PASSWORD_KEY, newPassword);
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin: !!user, loading, signIn, signOut, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
