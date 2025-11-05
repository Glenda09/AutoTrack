import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
const menuItems = [
    { label: "Dashboard", icon: "pi pi-home", to: "/" },
    { label: "Clientes", icon: "pi pi-users", to: "/clientes" },
    { label: "Vehículos", icon: "pi pi-car", to: "/vehiculos" },
    { label: "Inventario", icon: "pi pi-box", to: "/inventario" },
    { label: "Órdenes de Trabajo", icon: "pi pi-briefcase", to: "/otes" },
    { label: "Facturación", icon: "pi pi-file", to: "/facturacion" },
    { label: "Citas", icon: "pi pi-calendar", to: "/citas" },
    { label: "Reportes", icon: "pi pi-chart-line", to: "/reportes" },
    { label: "Usuarios", icon: "pi pi-lock", to: "/usuarios", roles: ["Admin"] },
];
export const Sidebar = () => {
    const { hasRole } = useAuth();
    return (_jsxs("aside", { className: "sidebar", children: [_jsx("div", { className: "sidebar__brand", children: "AutoTrack" }), _jsx("nav", { children: _jsx("ul", { children: menuItems
                        .filter((item) => hasRole(item.roles))
                        .map((item) => (_jsx("li", { children: _jsxs(NavLink, { to: item.to, className: ({ isActive }) => (isActive ? "active" : ""), children: [_jsx("i", { className: `${item.icon} mr-2` }), item.label] }) }, item.to))) }) })] }));
};
