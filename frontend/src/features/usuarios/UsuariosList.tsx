import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { ColumnDef, DataTable } from "../../components/UI/DataTable";
import { useAuth } from "../../auth/useAuth";
import { http } from "../../api/http";
import { endpoints } from "../../api/endpoints";
import { roleDescriptions } from "./roles-permisos";

interface Usuario {
  id: number;
  username: string;
  nombre_completo: string;
  email?: string;
  rol_id: number;
}

export const UsuariosList = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [rolesMap, setRolesMap] = useState<Record<number, { name: string }>>({});

  useEffect(() => {
    if (!hasRole(["Admin"])) return;
    Promise.all([http.get(endpoints.usuarios), http.get(endpoints.roles)]).then(([usuariosRes, rolesRes]) => {
      setUsuarios(usuariosRes.data);
      const map: Record<number, { name: string }> = {};
      rolesRes.data.forEach((rol: { id: number; name: string }) => {
        map[rol.id] = { name: rol.name };
      });
      setRolesMap(map);
    });
  }, [hasRole]);

  if (!hasRole(["Admin"])) {
    return <div>No tienes permisos para ver usuarios.</div>;
  }

  const columns: ColumnDef<Usuario>[] = [
    { field: "username", header: "Usuario" },
    { field: "nombre_completo", header: "Nombre" },
    { field: "email", header: "Email" },
    {
      field: "rol_id",
      header: "Rol",
      body: (row) => rolesMap[row.rol_id]?.name ?? "N/A",
    },
    {
      field: "detalle",
      header: "Descripción",
      body: (row) => roleDescriptions[rolesMap[row.rol_id]?.name ?? ""] ?? "",
    },
    {
      field: "actions",
      header: "Acciones",
      body: (row) => (
        <Button icon="pi pi-pencil" text rounded onClick={() => navigate(`/usuarios/${row.id}`)} />
      ),
    },
  ];

  return (
    <div className="flex flex-column gap-3">
      <div className="flex align-items-center justify-content-between">
        <h2>Usuarios</h2>
        <Button label="Nuevo usuario" icon="pi pi-plus" onClick={() => navigate("/usuarios/nuevo")} />
      </div>
      <DataTable value={usuarios} columns={columns} rows={10} />
    </div>
  );
};
