import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "primereact/button";
import { useAuth } from "../../auth/useAuth";
export const Topbar = () => {
    const { user, logout } = useAuth();
    return (_jsxs("header", { className: "topbar flex align-items-center justify-content-between px-3", children: [_jsx("div", { children: _jsx("span", { className: "text-xl font-semibold", children: "Panel AutoTrack" }) }), _jsxs("div", { className: "flex align-items-center gap-3", children: [_jsxs("div", { className: "text-right", children: [_jsx("div", { className: "font-medium", children: user?.nombre_completo }), _jsx("small", { className: "text-500", children: user?.rol ?? "Sin rol" })] }), _jsx(Button, { label: "Cerrar sesi\u00F3n", icon: "pi pi-sign-out", onClick: logout, text: true })] })] }));
};
