import { NavLink } from "react-router-dom";
import { Role } from "../../auth/AuthContext";
import { useAuth } from "../../auth/useAuth";

interface MenuItem {
  label: string;
  icon: string;
  to: string;
  roles?: Role[];
}

const staffRoles: Role[] = ["Admin", "Supervisor", "Mecanico", "Facturacion", "Inventario"];

const menuItems: MenuItem[] = [
  { label: "Inicio", icon: "pi pi-home", to: "/" },
  { label: "Clientes", icon: "pi pi-users", to: "/clientes", roles: staffRoles },
  { label: "Ordenes de Trabajo", icon: "pi pi-briefcase", to: "/otes", roles: staffRoles },
  { label: "Agenda", icon: "pi pi-calendar", to: "/citas" }, // disponible para Cliente para solicitud/consulta
  { label: "Inventario", icon: "pi pi-box", to: "/inventario", roles: staffRoles },
  { label: "Facturacion", icon: "pi pi-file", to: "/facturacion", roles: staffRoles },
  { label: "Reportes", icon: "pi pi-chart-line", to: "/reportes", roles: ["Admin", "Supervisor", "Facturacion"] },
  { label: "Usuarios/Config", icon: "pi pi-cog", to: "/usuarios", roles: ["Admin"] },
];

export const Sidebar = () => {
  const { hasRole } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <i className="pi pi-car text-primary" />
        <span>AutoTrack</span>
      </div>
      <nav>
        <ul>
          {menuItems
            .filter((item) => hasRole(item.roles))
            .map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={({ isActive }) => (isActive ? "active" : "")}>
                  <i className={`${item.icon}`} />
                  {item.label}
                </NavLink>
              </li>
            ))}
        </ul>
      </nav>
    </aside>
  );
};
