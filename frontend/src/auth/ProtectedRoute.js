import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";
export const ProtectedRoute = ({ roles }) => {
    const { user, loading, hasRole } = useAuth();
    const location = useLocation();
    if (loading) {
        return _jsx("div", { className: "p-4 text-center", children: "Cargando..." });
    }
    if (!user) {
        return _jsx(Navigate, { to: "/login", state: { from: location }, replace: true });
    }
    if (!hasRole(roles)) {
        return _jsx(Navigate, { to: "/", replace: true });
    }
    return _jsx(Outlet, {});
};
