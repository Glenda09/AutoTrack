import { NavLink } from "react-router-dom";
import { Role } from "../../auth/AuthContext";
import { useAuth } from "../../auth/useAuth";

interface MenuItem {
  label: string;
  icon: string;
  to: string;
  roles?: Role[];
}

const menuItems: MenuItem[] = [
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

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">AutoTrack</div>
      <nav>
        <ul>
          {menuItems
            .filter((item) => hasRole(item.roles))
            .map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={({ isActive }) => (isActive ? "active" : "")}>
                  <i className={`${item.icon} mr-2`} />
                  {item.label}
                </NavLink>
              </li>
            ))}
        </ul>
      </nav>
    </aside>
  );
};
