import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { DataTable } from "../../components/UI/DataTable";
import { usePagination } from "../../hooks/usePagination";
import { useConfirm } from "../../hooks/useConfirm";
import { deleteCliente, listClientes } from "./clientes.api";
export const ClientesList = () => {
    const navigate = useNavigate();
    const confirm = useConfirm();
    const { first, rows, currentPage, onPageChange } = usePagination();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [clientes, setClientes] = useState([]);
    const [total, setTotal] = useState(0);
    const load = async () => {
        setLoading(true);
        try {
            const data = await listClientes({ search, page: currentPage, size: rows });
            setClientes(data.items);
            setTotal(data.total);
        }
        catch (error) {
            console.error("Error loading clientes", error);
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
        { field: "nombre", header: "Nombre" },
        { field: "telefono", header: "Teléfono" },
        { field: "email", header: "Email" },
        { field: "nit", header: "NIT" },
        {
            field: "actions",
            header: "Acciones",
            body: (row) => (_jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { icon: "pi pi-pencil", rounded: true, text: true, onClick: () => navigate(`/clientes/${row.id}`) }), _jsx(Button, { icon: "pi pi-trash", rounded: true, text: true, severity: "danger", onClick: () => confirm({
                            message: "¿Eliminar cliente?",
                            accept: async () => {
                                await deleteCliente(row.id);
                                load();
                            },
                        }) })] })),
        },
    ];
    return (_jsxs("div", { className: "flex flex-column gap-3", children: [_jsxs("div", { className: "flex align-items-center justify-content-between", children: [_jsx("h2", { children: "Clientes" }), _jsx(Button, { label: "Nuevo", icon: "pi pi-plus", onClick: () => navigate("/clientes/nuevo") })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("span", { className: "p-input-icon-left", children: [_jsx("i", { className: "pi pi-search" }), _jsx(InputText, { placeholder: "Buscar...", value: search, onChange: (e) => setSearch(e.target.value), onKeyDown: (e) => {
                                    if (e.key === "Enter") {
                                        load();
                                    }
                                } })] }), _jsx(Button, { label: "Buscar", onClick: load, outlined: true })] }), _jsx(DataTable, { value: clientes, columns: columns, loading: loading, totalRecords: total, rows: rows, first: first, onPage: onPageChange })] }));
};
