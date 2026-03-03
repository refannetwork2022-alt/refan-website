import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { auth, db } from "@/integrations/firebase/client";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

interface AdminUser {
  email: string;
}

interface AuthContext {
  user: AdminUser | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContext | undefined>(undefined);

const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || "").toLowerCase();

const checkAdminRole = async (firebaseUser: User): Promise<boolean> => {
  // Check whitelist first
  if (firebaseUser.email?.toLowerCase() === ADMIN_EMAIL) return true;
  // Then check Firestore user_roles collection
  try {
    const q = query(
      collection(db, "user_roles"),
      where("user_id", "==", firebaseUser.uid),
      where("role", "==", "admin")
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch { return false; }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const admin = await checkAdminRole(firebaseUser);
        setUser({ email: firebaseUser.email || '' });
        setIsAdmin(admin);
        if (!admin) {
          await firebaseSignOut(auth);
          setUser(null);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      const admin = await checkAdminRole(result.user);
      if (!admin) {
        await firebaseSignOut(auth);
        return { error: "Not authorized. Only admin accounts can access this area." };
      }
      setUser({ email: result.user.email || '' });
      setIsAdmin(true);
      return { error: null };
    } catch (e: any) {
      const msg = e.code === 'auth/invalid-credential' ? 'Invalid email or password.'
        : e.code === 'auth/user-not-found' ? 'No account found with this email.'
        : e.code === 'auth/wrong-password' ? 'Incorrect password.'
        : e.code === 'auth/too-many-requests' ? 'Too many attempts. Please try again later.'
        : e.message || 'Sign in failed.';
      return { error: msg };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const admin = await checkAdminRole(result.user);
      if (!admin) {
        await firebaseSignOut(auth);
        return { error: "Not authorized. Only admin accounts can access this area." };
      }
      setUser({ email: result.user.email || '' });
      setIsAdmin(true);
      return { error: null };
    } catch (e: any) {
      if (e.code === 'auth/popup-closed-by-user') return { error: null };
      return { error: e.message || 'Google sign in failed.' };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setIsAdmin(false);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (newPassword.length < 6) {
      return { error: "New password must be at least 6 characters" };
    }
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      return { error: "No user session found" };
    }
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      return { error: null };
    } catch (e: any) {
      if (e.code === 'auth/wrong-password') return { error: "Current password is incorrect" };
      return { error: e.message || "Password change failed" };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { error: null };
    } catch (e: any) {
      const msg = e.code === 'auth/user-not-found' ? 'No account found with this email. If you use Google sign-in, use that option instead.'
        : e.code === 'auth/invalid-email' ? 'Please enter a valid email address.'
        : e.code === 'auth/too-many-requests' ? 'Too many attempts. Please wait a few minutes and try again.'
        : e.message || "Failed to send reset email";
      return { error: msg };
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signIn, signInWithGoogle, signOut, changePassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
