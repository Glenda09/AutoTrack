import { Button } from "primereact/button";
import { useAuth } from "../../auth/useAuth";

export const Topbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="topbar flex align-items-center justify-content-between px-3">
      <div>
        <span className="text-xl font-semibold">Panel AutoTrack</span>
      </div>
      <div className="flex align-items-center gap-3">
        <div className="text-right">
          <div className="font-medium">{user?.nombre_completo}</div>
          <small className="text-500">{user?.rol ?? "Sin rol"}</small>
        </div>
        <Button label="Cerrar sesión" icon="pi pi-sign-out" onClick={logout} text />
      </div>
    </header>
  );
};
