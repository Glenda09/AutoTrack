import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { DataTable } from "../../components/UI/DataTable";
import { useAuth } from "../../auth/useAuth";
import { http } from "../../api/http";
import { endpoints } from "../../api/endpoints";
import { roleDescriptions } from "./roles-permisos";
export const UsuariosList = () => {
    const { hasRole } = useAuth();
    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState([]);
    const [rolesMap, setRolesMap] = useState({});
    useEffect(() => {
        if (!hasRole(["Admin"]))
            return;
        Promise.all([http.get(endpoints.usuarios), http.get(endpoints.roles)]).then(([usuariosRes, rolesRes]) => {
            setUsuarios(usuariosRes.data);
            const map = {};
            rolesRes.data.forEach((rol) => {
                map[rol.id] = { name: rol.name };
            });
            setRolesMap(map);
        });
    }, [hasRole]);
    if (!hasRole(["Admin"])) {
        return _jsx("div", { children: "No tienes permisos para ver usuarios." });
    }
    const columns = [
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
            body: (row) => (_jsx(Button, { icon: "pi pi-pencil", text: true, rounded: true, onClick: () => navigate(`/usuarios/${row.id}`) })),
        },
    ];
    return (_jsxs("div", { className: "flex flex-column gap-3", children: [_jsxs("div", { className: "flex align-items-center justify-content-between", children: [_jsx("h2", { children: "Usuarios" }), _jsx(Button, { label: "Nuevo usuario", icon: "pi pi-plus", onClick: () => navigate("/usuarios/nuevo") })] }), _jsx(DataTable, { value: usuarios, columns: columns, rows: 10 })] }));
};
