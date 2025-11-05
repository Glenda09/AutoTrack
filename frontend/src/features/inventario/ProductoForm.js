import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Formik } from "formik";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { formatDate } from "../../utils/formatters";
import { productoSchema } from "../../utils/validators";
import { createPrecio, getProducto, listHistorial, saveProducto } from "./productos.api";
export const ProductoForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [initialValues, setInitialValues] = useState({
        sku: "",
        nombre: "",
        descripcion: "",
        stock_actual: 0,
        stock_minimo: 0,
        ubicacion: "",
        proveedor_principal: "",
    });
    const [historial, setHistorial] = useState([]);
    const [priceForm, setPriceForm] = useState({ precio_unitario: "", costo_unitario: "" });
    useEffect(() => {
        if (id) {
            getProducto(Number(id)).then((data) => {
                setInitialValues({
                    id: data.id,
                    sku: data.sku,
                    nombre: data.nombre,
                    descripcion: data.descripcion,
                    stock_actual: data.stock_actual,
                    stock_minimo: data.stock_minimo,
                    ubicacion: data.ubicacion,
                    proveedor_principal: data.proveedor_principal,
                });
                listHistorial(Number(id)).then(setHistorial);
            });
        }
    }, [id]);
    const handleCreatePrice = async () => {
        if (!id)
            return;
        await createPrecio(Number(id), {
            fecha_inicio: new Date().toISOString(),
            precio_unitario: priceForm.precio_unitario,
            costo_unitario: priceForm.costo_unitario,
        });
        setPriceForm({ precio_unitario: "", costo_unitario: "" });
        const updated = await listHistorial(Number(id));
        setHistorial(updated);
    };
    return (_jsxs("div", { className: "flex flex-column gap-4", children: [_jsx(Card, { title: id ? "Editar Producto" : "Nuevo Producto", children: _jsx(Formik, { enableReinitialize: true, initialValues: initialValues, validationSchema: productoSchema, onSubmit: async (values, { setSubmitting }) => {
                        try {
                            await saveProducto(values);
                            navigate("/inventario");
                        }
                        catch (error) {
                            console.error("Error saving producto", error);
                        }
                        finally {
                            setSubmitting(false);
                        }
                    }, children: ({ values, handleChange, handleBlur, errors, touched, isSubmitting }) => (_jsxs(Form, { className: "grid formgrid p-fluid", children: [_jsxs("div", { className: "field col-12 md:col-4", children: [_jsx("label", { htmlFor: "sku", children: "SKU" }), _jsx(InputText, { id: "sku", name: "sku", value: values.sku, onChange: handleChange, onBlur: handleBlur }), touched.sku && errors.sku && _jsx("small", { className: "p-error", children: errors.sku })] }), _jsxs("div", { className: "field col-12 md:col-8", children: [_jsx("label", { htmlFor: "nombre", children: "Nombre" }), _jsx(InputText, { id: "nombre", name: "nombre", value: values.nombre, onChange: handleChange, onBlur: handleBlur }), touched.nombre && errors.nombre && _jsx("small", { className: "p-error", children: errors.nombre })] }), _jsxs("div", { className: "field col-12", children: [_jsx("label", { htmlFor: "descripcion", children: "Descripci\u00F3n" }), _jsx(InputText, { id: "descripcion", name: "descripcion", value: values.descripcion ?? "", onChange: handleChange, onBlur: handleBlur })] }), _jsxs("div", { className: "field col-12 md:col-4", children: [_jsx("label", { htmlFor: "stock_actual", children: "Stock actual" }), _jsx(InputText, { id: "stock_actual", name: "stock_actual", value: values.stock_actual?.toString() ?? "0", onChange: handleChange, onBlur: handleBlur }), touched.stock_actual && errors.stock_actual && _jsx("small", { className: "p-error", children: errors.stock_actual })] }), _jsxs("div", { className: "field col-12 md:col-4", children: [_jsx("label", { htmlFor: "stock_minimo", children: "Stock m\u00EDnimo" }), _jsx(InputText, { id: "stock_minimo", name: "stock_minimo", value: values.stock_minimo?.toString() ?? "0", onChange: handleChange, onBlur: handleBlur }), touched.stock_minimo && errors.stock_minimo && _jsx("small", { className: "p-error", children: errors.stock_minimo })] }), _jsxs("div", { className: "field col-12 md:col-4", children: [_jsx("label", { htmlFor: "ubicacion", children: "Ubicaci\u00F3n" }), _jsx(InputText, { id: "ubicacion", name: "ubicacion", value: values.ubicacion ?? "", onChange: handleChange, onBlur: handleBlur })] }), _jsxs("div", { className: "field col-12 md:col-6", children: [_jsx("label", { htmlFor: "proveedor_principal", children: "Proveedor" }), _jsx(InputText, { id: "proveedor_principal", name: "proveedor_principal", value: values.proveedor_principal ?? "", onChange: handleChange, onBlur: handleBlur })] }), _jsxs("div", { className: "col-12 flex justify-content-end gap-2", children: [_jsx(Button, { type: "button", label: "Cancelar", text: true, onClick: () => navigate("/inventario") }), _jsx(Button, { type: "submit", label: "Guardar", loading: isSubmitting })] })] })) }) }), id && (_jsxs(Card, { title: "Historial de precios", children: [_jsxs("div", { className: "flex gap-2 mb-3", children: [_jsx(InputText, { placeholder: "Precio unitario", value: priceForm.precio_unitario, onChange: (e) => setPriceForm((prev) => ({ ...prev, precio_unitario: e.target.value })) }), _jsx(InputText, { placeholder: "Costo unitario", value: priceForm.costo_unitario, onChange: (e) => setPriceForm((prev) => ({ ...prev, costo_unitario: e.target.value })) }), _jsx(Button, { label: "Actualizar precio", onClick: handleCreatePrice, disabled: !priceForm.precio_unitario })] }), _jsxs(DataTable, { value: historial, rows: 5, paginator: true, children: [_jsx(Column, { field: "fecha_inicio", header: "Vigencia", body: (row) => formatDate(row.fecha_inicio) }), _jsx(Column, { field: "precio_unitario", header: "Precio" }), _jsx(Column, { field: "costo_unitario", header: "Costo" })] })] }))] }));
};
