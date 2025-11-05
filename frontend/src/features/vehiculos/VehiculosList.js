import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { DataTable } from "../../components/UI/DataTable";
import { usePagination } from "../../hooks/usePagination";
import { useConfirm } from "../../hooks/useConfirm";
import { deleteVehiculo, listVehiculos } from "./vehiculos.api";
export const VehiculosList = () => {
    const navigate = useNavigate();
    const confirm = useConfirm();
    const { first, rows, currentPage, onPageChange } = usePagination();
    const [vehiculos, setVehiculos] = useState([]);
    const [total, setTotal] = useState(0);
    const [placa, setPlaca] = useState("");
    const [loading, setLoading] = useState(false);
    const load = async () => {
        setLoading(true);
        try {
            const data = await listVehiculos({ placa, page: currentPage, size: rows });
            setVehiculos(data.items);
            setTotal(data.total);
        }
        catch (error) {
            console.error("Error loading vehiculos", error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, rows]);
    const columns = [
        { field: "placa", header: "Placa" },
        { field: "marca", header: "Marca" },
        { field: "modelo", header: "Modelo" },
        { field: "anio", header: "Año" },
        {
            field: "actions",
            header: "Acciones",
            body: (row) => (_jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { icon: "pi pi-pencil", rounded: true, text: true, onClick: () => navigate(`/vehiculos/${row.id}`) }), _jsx(Button, { icon: "pi pi-trash", rounded: true, text: true, severity: "danger", onClick: () => confirm({
                            message: "¿Eliminar vehículo?",
                            accept: async () => {
                                await deleteVehiculo(row.id);
                                load();
                            },
                        }) })] })),
        },
    ];
    return (_jsxs("div", { className: "flex flex-column gap-3", children: [_jsxs("div", { className: "flex align-items-center justify-content-between", children: [_jsx("h2", { children: "Veh\u00EDculos" }), _jsx(Button, { label: "Nuevo", icon: "pi pi-plus", onClick: () => navigate("/vehiculos/nuevo") })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(InputText, { placeholder: "Filtrar por placa", value: placa, onChange: (e) => setPlaca(e.target.value), onKeyDown: (e) => e.key === "Enter" && load() }), _jsx(Button, { label: "Buscar", onClick: load, outlined: true })] }), _jsx(DataTable, { value: vehiculos, columns: columns, loading: loading, totalRecords: total, rows: rows, first: first, onPage: onPageChange })] }));
};
