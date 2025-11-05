import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { DataTable } from "../../components/UI/DataTable";
import { usePagination } from "../../hooks/usePagination";
import { useConfirm } from "../../hooks/useConfirm";
import { deleteProducto, listProductos } from "./productos.api";
export const ProductosList = () => {
    const navigate = useNavigate();
    const confirm = useConfirm();
    const { first, rows, currentPage, onPageChange } = usePagination();
    const [productos, setProductos] = useState([]);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const load = async () => {
        setLoading(true);
        try {
            const data = await listProductos({ search, page: currentPage, size: rows });
            setProductos(data.items);
            setTotal(data.total);
        }
        catch (error) {
            console.error("Error loading productos", error);
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
        { field: "sku", header: "SKU" },
        { field: "nombre", header: "Nombre" },
        {
            field: "stock_actual",
            header: "Stock",
            body: (row) => (_jsx(Tag, { value: `${row.stock_actual} uds`, severity: row.stock_actual <= row.stock_minimo ? "danger" : "success" })),
        },
        {
            field: "stock_minimo",
            header: "Stock mínimo",
        },
        {
            field: "stock_reservado",
            header: "Reservado",
        },
        {
            field: "actions",
            header: "Acciones",
            body: (row) => (_jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { icon: "pi pi-pencil", rounded: true, text: true, onClick: () => navigate(`/inventario/${row.id}`) }), _jsx(Button, { icon: "pi pi-trash", rounded: true, text: true, severity: "danger", onClick: () => confirm({
                            message: "¿Eliminar producto?",
                            accept: async () => {
                                await deleteProducto(row.id);
                                load();
                            },
                        }) })] })),
        },
    ];
    return (_jsxs("div", { className: "flex flex-column gap-3", children: [_jsxs("div", { className: "flex align-items-center justify-content-between", children: [_jsx("h2", { children: "Inventario" }), _jsx(Button, { label: "Nuevo producto", icon: "pi pi-plus", onClick: () => navigate("/inventario/nuevo") })] }), _jsxs("div", { className: "flex gap-2 align-items-center", children: [_jsx(InputText, { placeholder: "Buscar por nombre o SKU", value: search, onChange: (e) => setSearch(e.target.value), onKeyDown: (e) => e.key === "Enter" && load() }), _jsx(Button, { label: "Buscar", onClick: load, outlined: true })] }), _jsx(DataTable, { value: productos, columns: columns, loading: loading, totalRecords: total, rows: rows, first: first, onPage: onPageChange })] }));
};
