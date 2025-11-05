import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { DataTable } from "../../components/UI/DataTable";
import { usePagination } from "../../hooks/usePagination";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { createFactura, listFacturas } from "./facturas.api";
const estadoOptions = [
    { label: "Todos", value: "" },
    { label: "Pagada", value: "Pagada" },
    { label: "Pendiente", value: "Pendiente" },
    { label: "Parcial", value: "Parcial" },
];
export const FacturasList = () => {
    const navigate = useNavigate();
    const { first, rows, currentPage, onPageChange } = usePagination();
    const [facturas, setFacturas] = useState([]);
    const [total, setTotal] = useState(0);
    const [estado, setEstado] = useState("");
    const [loading, setLoading] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [form, setForm] = useState({ orden_id: "", monto_total: "", impuesto_aplicado: "", metodo_pago: "Efectivo" });
    const load = async () => {
        setLoading(true);
        try {
            const params = { page: currentPage, size: rows };
            if (estado)
                params.estado_pago = estado;
            const data = await listFacturas(params);
            setFacturas(data.items);
            setTotal(data.total);
        }
        catch (error) {
            console.error("Error loading facturas", error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, rows, estado]);
    const submitFactura = async () => {
        try {
            await createFactura({
                orden_id: Number(form.orden_id),
                monto_total: Number(form.monto_total),
                impuesto_aplicado: Number(form.impuesto_aplicado || 0),
                metodos_pago: [form.metodo_pago],
                metodo_pago: form.metodo_pago,
                estado_pago: "Pagada",
            });
            setShowDialog(false);
            setForm({ orden_id: "", monto_total: "", impuesto_aplicado: "", metodo_pago: "Efectivo" });
            load();
        }
        catch (error) {
            console.error("Error creando factura", error);
        }
    };
    const columns = [
        { field: "id", header: "#" },
        {
            field: "fecha_factura",
            header: "Fecha",
            body: (row) => formatDate(row.fecha_factura),
        },
        { field: "orden_id", header: "OT" },
        {
            field: "monto_total",
            header: "Total",
            body: (row) => formatCurrency(row.monto_total),
        },
        {
            field: "estado_pago",
            header: "Estado",
            body: (row) => _jsx(Tag, { value: row.estado_pago, severity: row.estado_pago === "Pagada" ? "success" : "warning" }),
        },
        {
            field: "actions",
            header: "Acciones",
            body: (row) => (_jsx(Button, { icon: "pi pi-eye", text: true, rounded: true, onClick: () => navigate(`/facturacion/${row.id}`) })),
        },
    ];
    return (_jsxs("div", { className: "flex flex-column gap-3", children: [_jsxs("div", { className: "flex align-items-center justify-content-between", children: [_jsx("h2", { children: "Facturaci\u00F3n" }), _jsx(Button, { label: "Nueva factura", icon: "pi pi-plus", onClick: () => setShowDialog(true) })] }), _jsx("div", { className: "flex gap-2 align-items-center", children: _jsx(Dropdown, { value: estado, options: estadoOptions, onChange: (e) => setEstado(e.value), placeholder: "Estado" }) }), _jsx(DataTable, { value: facturas, columns: columns, loading: loading, totalRecords: total, rows: rows, first: first, onPage: onPageChange }), _jsx(Dialog, { header: "Nueva factura", visible: showDialog, onHide: () => setShowDialog(false), style: { width: "30rem" }, children: _jsxs("div", { className: "flex flex-column gap-3", children: [_jsxs("span", { className: "p-float-label", children: [_jsx(InputText, { id: "orden", value: form.orden_id, onChange: (e) => setForm((prev) => ({ ...prev, orden_id: e.target.value })) }), _jsx("label", { htmlFor: "orden", children: "ID de OT" })] }), _jsxs("span", { className: "p-float-label", children: [_jsx(InputText, { id: "monto", value: form.monto_total, onChange: (e) => setForm((prev) => ({ ...prev, monto_total: e.target.value })) }), _jsx("label", { htmlFor: "monto", children: "Monto total" })] }), _jsxs("span", { className: "p-float-label", children: [_jsx(InputText, { id: "impuesto", value: form.impuesto_aplicado, onChange: (e) => setForm((prev) => ({ ...prev, impuesto_aplicado: e.target.value })) }), _jsx("label", { htmlFor: "impuesto", children: "Impuesto aplicado" })] }), _jsxs("span", { className: "p-float-label", children: [_jsx(InputText, { id: "metodo", value: form.metodo_pago, onChange: (e) => setForm((prev) => ({ ...prev, metodo_pago: e.target.value })) }), _jsx("label", { htmlFor: "metodo", children: "M\u00E9todo de pago" })] }), _jsx(Button, { label: "Crear", onClick: submitFactura, disabled: !form.orden_id || !form.monto_total })] }) })] }));
};
