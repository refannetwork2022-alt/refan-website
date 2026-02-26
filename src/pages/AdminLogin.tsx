import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const [resetEmail, setResetEmail] = useState("");
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

  const handleResetPassword = async () => {
    setForgotError("");
    if (!resetEmail.trim()) {
      setForgotError("Please enter your email address.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
      redirectTo: `${window.location.origin}/admin-login`,
    });
    if (error) {
      setForgotError(error.message);
    } else {
      setForgotSuccess(true);
    }
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
                <p className="text-green-600 font-medium">Password reset email sent! Check your inbox.</p>
                <p className="text-sm text-muted-foreground">If you don't see it, check your spam folder.</p>
                <Button onClick={() => { setShowForgot(false); setForgotSuccess(false); setResetEmail(''); }} className="w-full">
                  <LogIn className="h-4 w-4 mr-2" /> Back to Login
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Enter your admin email and we'll send you a password reset link.</p>
                <div>
                  <label className="text-sm font-medium mb-1 block">Email Address</label>
                  <Input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="your@email.com" />
                </div>
                {forgotError && <p className="text-sm text-destructive">{forgotError}</p>}
                <Button onClick={handleResetPassword} className="w-full">Send Reset Link</Button>
                <button onClick={() => setShowForgot(false)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mx-auto">
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
