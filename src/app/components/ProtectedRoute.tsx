import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Loader2, Shield } from "lucide-react";

export function ProtectedRoute() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="w-10 h-10 bg-foreground rounded-xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-background" strokeWidth={2.5} />
        </div>
        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
