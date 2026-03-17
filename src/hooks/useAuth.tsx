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
import { type SubAdmin, type TabPermission } from "@/lib/store";

interface AdminUser {
  email: string;
}

interface AuthContext {
  user: AdminUser | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  subAdminProfile: SubAdmin | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  getTabPermission: (tab: string) => TabPermission;
  canEdit: (tab: string) => boolean;
  canView: (tab: string) => boolean;
  canDelete: (tab: string) => boolean;
  shouldHideExisting: (tab: string) => boolean;
}

const AuthContext = createContext<AuthContext | undefined>(undefined);

const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || "refannetwork2022@gmail.com").trim().toLowerCase();

const checkAdminRole = async (firebaseUser: User): Promise<{ isAdmin: boolean; isSuperAdmin: boolean; subAdminProfile: SubAdmin | null }> => {
  const email = firebaseUser.email?.toLowerCase() || '';

  // Check super admin first
  if (email === ADMIN_EMAIL) {
    return { isAdmin: true, isSuperAdmin: true, subAdminProfile: null };
  }

  // Check Firestore user_roles collection
  try {
    const q = query(
      collection(db, "user_roles"),
      where("user_id", "==", firebaseUser.uid),
      where("role", "==", "admin")
    );
    const snap = await getDocs(q);
    if (!snap.empty) return { isAdmin: true, isSuperAdmin: true, subAdminProfile: null };
  } catch {}

  return { isAdmin: false, isSuperAdmin: false, subAdminProfile: null };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [subAdminProfile, setSubAdminProfile] = useState<SubAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const result = await checkAdminRole(firebaseUser);
        setUser({ email: firebaseUser.email || '' });
        setIsAdmin(result.isAdmin);
        setIsSuperAdmin(result.isSuperAdmin);
        setSubAdminProfile(result.subAdminProfile);
        if (!result.isAdmin) {
          await firebaseSignOut(auth);
          setUser(null);
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setSubAdminProfile(null);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setSubAdminProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      const adminCheck = await checkAdminRole(result.user);
      if (!adminCheck.isAdmin) {
        await firebaseSignOut(auth);
        return { error: "Not authorized. Only admin accounts can access this area." };
      }
      setUser({ email: result.user.email || '' });
      setIsAdmin(true);
      setIsSuperAdmin(adminCheck.isSuperAdmin);
      setSubAdminProfile(adminCheck.subAdminProfile);
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
      const adminCheck = await checkAdminRole(result.user);
      if (!adminCheck.isAdmin) {
        await firebaseSignOut(auth);
        return { error: "Not authorized. Only admin accounts can access this area." };
      }
      setUser({ email: result.user.email || '' });
      setIsAdmin(true);
      setIsSuperAdmin(adminCheck.isSuperAdmin);
      setSubAdminProfile(adminCheck.subAdminProfile);
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
    setIsSuperAdmin(false);
    setSubAdminProfile(null);
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

  // Permission helpers
  const getTabPermission = (tab: string): TabPermission => {
    if (isSuperAdmin) return 'edit';
    if (!subAdminProfile) return 'hidden';
    return subAdminProfile.permissions[tab] || 'hidden';
  };

  const canEdit = (tab: string): boolean => {
    const p = getTabPermission(tab);
    return p === 'edit' || p === 'full';
  };
  const canView = (tab: string): boolean => {
    const p = getTabPermission(tab);
    return p === 'edit' || p === 'view' || p === 'full';
  };
  const canDelete = (tab: string): boolean => {
    if (isSuperAdmin) return true;
    if (!subAdminProfile) return false;
    const p = getTabPermission(tab);
    if (p === 'full') return true;
    return (p === 'edit' || p === 'view') && subAdminProfile.allowDelete?.[tab] === true;
  };
  const shouldHideExisting = (tab: string): boolean => {
    if (isSuperAdmin) return false;
    if (!subAdminProfile) return true;
    return subAdminProfile.hideExistingData[tab] === true;
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isSuperAdmin, subAdminProfile, loading, signIn, signInWithGoogle, signOut, changePassword, resetPassword, getTabPermission, canEdit, canView, canDelete, shouldHideExisting }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
