import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Role } from "./AuthContext";
import { useAuth } from "./useAuth";

interface ProtectedRouteProps {
  roles?: Role[];
}

export const ProtectedRoute = ({ roles }: ProtectedRouteProps) => {
  const { user, loading, hasRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-4 text-center">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasRole(roles)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
