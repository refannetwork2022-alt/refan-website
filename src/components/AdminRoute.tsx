import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin-login" replace state={{ reason: "unauthenticated" }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/admin-login" replace state={{ reason: "unauthorized" }} />;
  }

  return <>{children}</>;
};

export default AdminRoute;
