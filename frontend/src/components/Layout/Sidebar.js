import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
const staffRoles = ["Admin", "Supervisor", "Mecanico", "Facturacion", "Inventario"];
const menuItems = [
    { label: "Inicio", icon: "pi pi-home", to: "/" },
    { label: "Clientes", icon: "pi pi-users", to: "/clientes", roles: staffRoles },
    { label: "Vehiculos", icon: "pi pi-car", to: "/vehiculos", roles: staffRoles },
    { label: "Ordenes de Trabajo", icon: "pi pi-briefcase", to: "/otes", roles: staffRoles },
    { label: "Agenda", icon: "pi pi-calendar", to: "/citas" }, // disponible para Cliente para solicitud/consulta
    { label: "Inventario", icon: "pi pi-box", to: "/inventario", roles: staffRoles },
    { label: "Facturacion", icon: "pi pi-file", to: "/facturacion", roles: staffRoles },
    { label: "Reportes", icon: "pi pi-chart-line", to: "/reportes", roles: ["Admin", "Supervisor", "Facturacion"] },
    { label: "Usuarios/Config", icon: "pi pi-cog", to: "/usuarios", roles: ["Admin"] },
];
export const Sidebar = () => {
    const { hasRole } = useAuth();
    return (_jsxs("aside", { className: "sidebar", children: [_jsxs("div", { className: "sidebar__brand", children: [_jsx("i", { className: "pi pi-car text-primary" }), _jsx("span", { children: "AutoTrack" })] }), _jsx("nav", { children: _jsx("ul", { children: menuItems
                        .filter((item) => hasRole(item.roles))
                        .map((item) => (_jsx("li", { children: _jsxs(NavLink, { to: item.to, className: ({ isActive }) => (isActive ? "active" : ""), children: [_jsx("i", { className: `${item.icon}` }), item.label] }) }, item.to))) }) })] }));
};
