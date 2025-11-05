import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { getFactura, updateFactura } from "./facturas.api";
const estadoOptions = [
    { label: "Pagada", value: "Pagada" },
    { label: "Pendiente", value: "Pendiente" },
    { label: "Parcial", value: "Parcial" },
];
export const FacturaDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [factura, setFactura] = useState(null);
    const [monto, setMonto] = useState("");
    const [estado, setEstado] = useState("Pagada");
    useEffect(() => {
        if (id) {
            getFactura(Number(id)).then((data) => {
                setFactura(data);
                setMonto(data.monto_total.toString());
                setEstado(data.estado_pago);
            });
        }
    }, [id]);
    const handleSave = async () => {
        if (!id)
            return;
        await updateFactura(Number(id), { monto_total: Number(monto), estado_pago: estado });
        navigate("/facturacion");
    };
    if (!factura) {
        return _jsx("div", { children: "Cargando..." });
    }
    return (_jsxs(Card, { title: `Factura #${factura.id}`, children: [_jsxs("div", { className: "grid formgrid", children: [_jsxs("div", { className: "field col-12 md:col-4", children: [_jsx("label", { children: "Orden" }), _jsx("div", { children: factura.orden_id })] }), _jsxs("div", { className: "field col-12 md:col-4", children: [_jsx("label", { children: "Fecha" }), _jsx("div", { children: formatDate(factura.fecha_factura) })] }), _jsxs("div", { className: "field col-12 md:col-4", children: [_jsx("label", { children: "M\u00E9todo de pago" }), _jsx("div", { children: factura.metodo_pago })] }), _jsxs("div", { className: "field col-12 md:col-4", children: [_jsx("label", { children: "Monto total" }), _jsx(InputText, { value: monto, onChange: (e) => setMonto(e.target.value) })] }), _jsxs("div", { className: "field col-12 md:col-4", children: [_jsx("label", { children: "Estado" }), _jsx(Dropdown, { value: estado, options: estadoOptions, onChange: (e) => setEstado(e.value) })] }), _jsxs("div", { className: "field col-12 md:col-4", children: [_jsx("label", { children: "Impuesto" }), _jsx("div", { children: formatCurrency(factura.impuesto_aplicado) })] })] }), _jsxs("div", { className: "flex justify-content-end gap-2", children: [_jsx(Button, { label: "Volver", text: true, onClick: () => navigate("/facturacion") }), _jsx(Button, { label: "Guardar", onClick: handleSave })] })] }));
};
