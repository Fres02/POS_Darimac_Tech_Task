import { Navigate, Outlet } from "react-router-dom";
import type { Role } from "@pos/shared";
import { useAuth } from "../context/AuthContext";
import { AppShell } from "./layout/AppShell";

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: Role[] }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/pos"} replace />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
