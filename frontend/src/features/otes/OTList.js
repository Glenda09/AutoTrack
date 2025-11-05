import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { DataTable } from "../../components/UI/DataTable";
import { usePagination } from "../../hooks/usePagination";
import { useConfirm } from "../../hooks/useConfirm";
import { confirmarOrden, listOrdenes, marcarListaFacturar } from "./ot.api";
const estadoOptions = [
    { label: "Todos", value: "" },
    { label: "Pendiente", value: "Pendiente" },
    { label: "En Proceso", value: "EnProceso" },
    { label: "Completada", value: "Completada" },
    { label: "Entregada", value: "Entregada" },
];
const estadoSeverity = {
    Pendiente: "secondary",
    EnProceso: "info",
    Completada: "success",
    Entregada: "warning",
};
export const OTList = () => {
    const navigate = useNavigate();
    const confirm = useConfirm();
    const { first, rows, currentPage, onPageChange } = usePagination();
    const [ordenes, setOrdenes] = useState([]);
    const [total, setTotal] = useState(0);
    const [estado, setEstado] = useState("");
    const [loading, setLoading] = useState(false);
    const load = async () => {
        setLoading(true);
        try {
            const params = { page: currentPage, size: rows };
            if (estado)
                params.estado = estado;
            const data = await listOrdenes(params);
            setOrdenes(data.items);
            setTotal(data.total);
        }
        catch (error) {
            console.error("Error loading OT", error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, rows, estado]);
    const columns = [
        { field: "id", header: "ID" },
        {
            field: "estado",
            header: "Estado",
            body: (row) => _jsx(Tag, { value: row.estado, severity: estadoSeverity[row.estado] ?? "secondary" }),
        },
        {
            field: "confirmada",
            header: "Confirmada",
            body: (row) => _jsx("i", { className: `pi ${row.confirmada ? "pi-check-circle text-green-500" : "pi-times-circle text-red-400"}` }),
        },
        {
            field: "lista_para_facturar",
            header: "Lista Facturar",
            body: (row) => _jsx("i", { className: `pi ${row.lista_para_facturar ? "pi-check" : "pi-minus"}` }),
        },
        {
            field: "actions",
            header: "Acciones",
            body: (row) => (_jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { icon: "pi pi-eye", text: true, rounded: true, onClick: () => navigate(`/otes/${row.id}`) }), !row.confirmada && (_jsx(Button, { icon: "pi pi-lock", text: true, rounded: true, onClick: () => confirm({
                            message: "Confirmar orden y reservar inventario?",
                            accept: async () => {
                                await confirmarOrden(row.id);
                                load();
                            },
                        }) })), row.confirmada && !row.lista_para_facturar && (_jsx(Button, { icon: "pi pi-flag", text: true, rounded: true, onClick: () => confirm({
                            message: "Marcar como lista para facturar?",
                            accept: async () => {
                                await marcarListaFacturar(row.id);
                                load();
                            },
                        }) }))] })),
        },
    ];
    return (_jsxs("div", { className: "flex flex-column gap-3", children: [_jsxs("div", { className: "flex align-items-center justify-content-between", children: [_jsx("h2", { children: "\u00D3rdenes de Trabajo" }), _jsx(Button, { label: "Nueva OT", icon: "pi pi-plus", onClick: () => navigate("/otes/nuevo") })] }), _jsx("div", { className: "flex gap-2", children: _jsx(Dropdown, { value: estado, options: estadoOptions, onChange: (e) => setEstado(e.value), placeholder: "Estado" }) }), _jsx(DataTable, { value: ordenes, columns: columns, loading: loading, totalRecords: total, rows: rows, first: first, onPage: onPageChange })] }));
};
