import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, ArrowLeft } from "lucide-react";
import { store } from "@/lib/store";

const PASSWORD_KEY = "refan_admin_password";

const AdminLogin = () => {
  const { signIn, user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectReason = (location.state as { reason?: string })?.reason;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotAnswer, setForgotAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  useEffect(() => {
    if (redirectReason === "unauthenticated") {
      setError("Please sign in to access the admin area.");
    } else if (redirectReason === "unauthorized") {
      setError("Not authorized. Only admin emails can access this area.");
    }
  }, [redirectReason]);

  useEffect(() => {
    if (authLoading) return;
    if (user && isAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
    }
  };

  const handleResetPassword = () => {
    setForgotError("");
    if (!store.validateSecurityAnswer(forgotAnswer)) {
      setForgotError("Incorrect answer.");
      return;
    }
    if (newPassword.length < 6) {
      setForgotError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError("Passwords don't match.");
      return;
    }
    localStorage.setItem(PASSWORD_KEY, newPassword);
    setForgotSuccess(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-soft p-8">
        {!showForgot ? (
          <>
            <div className="text-center mb-8">
              <h1 className="font-heading text-2xl font-extrabold">
                <span className="text-primary">ReFA</span><span className="text-secondary">N</span> Admin
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Sign in to manage your site
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                <LogIn className="h-4 w-4 mr-2" />
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setShowForgot(true)}
                className="text-sm text-primary hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <h1 className="font-heading text-2xl font-extrabold">Reset Password</h1>
            </div>

            {forgotSuccess ? (
              <div className="text-center space-y-4">
                <p className="text-green-600 font-medium">Password has been reset successfully!</p>
                <Button onClick={() => { setShowForgot(false); setForgotSuccess(false); setForgotAnswer(''); setNewPassword(''); setConfirmPassword(''); }} className="w-full">
                  <LogIn className="h-4 w-4 mr-2" /> Back to Login
                </Button>
              </div>
            ) : store.hasSecurityQuestion() ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Security Question</label>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">{store.getSecurityQuestion()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Your Answer</label>
                  <Input value={forgotAnswer} onChange={(e) => setForgotAnswer(e.target.value)} placeholder="Enter your answer" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">New Password</label>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Confirm Password</label>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" />
                </div>
                {forgotError && <p className="text-sm text-destructive">{forgotError}</p>}
                <Button onClick={handleResetPassword} className="w-full">Reset Password</Button>
                <button onClick={() => setShowForgot(false)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mx-auto">
                  <ArrowLeft className="h-3 w-3" /> Back to login
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground text-sm">No security question has been configured. Please contact the system administrator to reset your password.</p>
                <button onClick={() => setShowForgot(false)} className="flex items-center gap-1 text-sm text-primary hover:underline mx-auto">
                  <ArrowLeft className="h-3 w-3" /> Back to login
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
