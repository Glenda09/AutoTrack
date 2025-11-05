import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FieldArray, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { ordenTrabajoSchema } from "./schemas";
import { getOrden, saveOrden } from "./ot.api";
import { listVehiculos } from "../vehiculos/vehiculos.api";
import { listProductos } from "../inventario/productos.api";
import { http } from "../../api/http";
import { endpoints } from "../../api/endpoints";
export const OTForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vehiculos, setVehiculos] = useState([]);
    const [productos, setProductos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [initialValues, setInitialValues] = useState({
        vehiculo_id: null,
        usuario_responsable_id: null,
        descripcion: "",
        detalles: [
            {
                tipo_item: "ManoObra",
                descripcion: "Diagnostico",
                cantidad: 1,
                precio_unitario: 0,
                producto_id: null,
            },
        ],
    });
    useEffect(() => {
        listVehiculos({ page: 1, size: 100 }).then((data) => setVehiculos(data.items.map((v) => ({ label: v.placa, value: v.id }))));
        listProductos({ page: 1, size: 100 }).then((data) => setProductos(data.items.map((p) => ({ label: p.nombre, value: p.id }))));
        http.get(endpoints.usuarios).then((res) => setUsuarios(res.data.map((u) => ({ label: u.nombre_completo, value: u.id }))));
        if (id) {
            getOrden(Number(id)).then((data) => setInitialValues({
                id: data.id,
                vehiculo_id: data.vehiculo_id,
                usuario_responsable_id: data.usuario_responsable_id ?? null,
                descripcion: data.descripcion,
                detalles: data.detalles.map((d) => ({
                    id: d.id,
                    tipo_item: d.tipo_item,
                    producto_id: d.producto_id ?? null,
                    descripcion: d.descripcion,
                    cantidad: d.cantidad,
                    precio_unitario: d.precio_unitario ?? null,
                })),
            }));
        }
    }, [id]);
    return (_jsx(Card, { title: id ? "Detalle OT" : "Nueva OT", children: _jsx(Formik, { enableReinitialize: true, initialValues: initialValues, validationSchema: ordenTrabajoSchema, onSubmit: async (values, { setSubmitting }) => {
                try {
                    const detallesPayload = values.detalles.map((detalle) => ({
                        id: detalle.id,
                        tipo_item: detalle.tipo_item,
                        producto_id: detalle.producto_id ?? undefined,
                        descripcion: detalle.descripcion,
                        cantidad: detalle.cantidad,
                        precio_unitario: detalle.precio_unitario ?? undefined,
                    }));
                    const payload = {
                        id: values.id,
                        vehiculo_id: values.vehiculo_id ?? undefined,
                        usuario_responsable_id: values.usuario_responsable_id ?? undefined,
                        descripcion: values.descripcion,
                        detalles: detallesPayload,
                    };
                    await saveOrden(payload);
                    navigate("/otes");
                }
                catch (error) {
                    console.error("Error saving OT", error);
                }
                finally {
                    setSubmitting(false);
                }
            }, children: ({ values, errors, touched, setFieldValue, isSubmitting }) => (_jsxs(Form, { className: "flex flex-column gap-3", children: [_jsxs("div", { className: "grid formgrid", children: [_jsxs("div", { className: "field col-12 md:col-4", children: [_jsx("label", { htmlFor: "vehiculo_id", children: "Vehiculo" }), _jsx(Dropdown, { id: "vehiculo_id", value: values.vehiculo_id, options: vehiculos, onChange: (e) => setFieldValue("vehiculo_id", e.value), placeholder: "Seleccione" }), touched.vehiculo_id && errors.vehiculo_id && _jsx("small", { className: "p-error", children: errors.vehiculo_id })] }), _jsxs("div", { className: "field col-12 md:col-4", children: [_jsx("label", { htmlFor: "usuario_responsable_id", children: "Responsable" }), _jsx(Dropdown, { id: "usuario_responsable_id", value: values.usuario_responsable_id, options: usuarios, onChange: (e) => setFieldValue("usuario_responsable_id", e.value), placeholder: "Seleccione" })] }), _jsxs("div", { className: "field col-12", children: [_jsx("label", { htmlFor: "descripcion", children: "Descripcion" }), _jsx(InputText, { id: "descripcion", value: values.descripcion ?? "", onChange: (e) => setFieldValue("descripcion", e.target.value) })] })] }), _jsx(FieldArray, { name: "detalles", children: ({ push, remove }) => (_jsxs("div", { className: "flex flex-column gap-3", children: [_jsxs("div", { className: "flex justify-content-between align-items-center", children: [_jsx("h3", { children: "Lineas" }), _jsx(Button, { type: "button", icon: "pi pi-plus", label: "Agregar linea", onClick: () => {
                                                const nuevaLinea = {
                                                    tipo_item: "ManoObra",
                                                    descripcion: "",
                                                    cantidad: 1,
                                                    precio_unitario: 0,
                                                    producto_id: null,
                                                };
                                                push(nuevaLinea);
                                            } })] }), values.detalles.map((detalle, index) => {
                                    const detalleErrors = (errors.detalles?.[index] ?? {});
                                    return (_jsx(Card, { className: "p-3", children: _jsxs("div", { className: "grid formgrid", children: [_jsxs("div", { className: "field col-12 md:col-3", children: [_jsx("label", { children: "Tipo" }), _jsx(Dropdown, { value: detalle.tipo_item, options: [
                                                                { label: "Repuesto", value: "Repuesto" },
                                                                { label: "Mano de obra", value: "ManoObra" },
                                                                { label: "Servicio externo", value: "ServicioExterno" },
                                                            ], onChange: (e) => setFieldValue(`detalles[${index}].tipo_item`, e.value) })] }), detalle.tipo_item === "Repuesto" && (_jsxs("div", { className: "field col-12 md:col-3", children: [_jsx("label", { children: "Producto" }), _jsx(Dropdown, { value: detalle.producto_id, options: productos, onChange: (e) => setFieldValue(`detalles[${index}].producto_id`, e.value), placeholder: "Selecciona producto" }), detalleErrors?.producto_id && _jsx("small", { className: "p-error", children: detalleErrors.producto_id })] })), _jsxs("div", { className: "field col-12 md:col-3", children: [_jsx("label", { children: "Cantidad" }), _jsx(InputText, { value: detalle.cantidad != null ? detalle.cantidad.toString() : "", onChange: (e) => setFieldValue(`detalles[${index}].cantidad`, Number(e.target.value) || 0) })] }), _jsxs("div", { className: "field col-12 md:col-3", children: [_jsx("label", { children: "Precio" }), _jsx(InputText, { value: detalle.precio_unitario != null ? detalle.precio_unitario.toString() : "", disabled: detalle.tipo_item === "Repuesto", onChange: (e) => setFieldValue(`detalles[${index}].precio_unitario`, e.target.value ? Number(e.target.value) : null) })] }), _jsxs("div", { className: "field col-12", children: [_jsx("label", { children: "Descripcion" }), _jsx(InputText, { value: detalle.descripcion ?? "", onChange: (e) => setFieldValue(`detalles[${index}].descripcion`, e.target.value) })] }), _jsx("div", { className: "field col-12 flex justify-content-end", children: _jsx(Button, { type: "button", icon: "pi pi-trash", severity: "danger", text: true, onClick: () => remove(index), disabled: values.detalles.length === 1 }) })] }) }, index));
                                })] })) }), _jsxs("div", { className: "flex justify-content-end gap-2", children: [_jsx(Button, { type: "button", label: "Cancelar", text: true, onClick: () => navigate("/otes") }), _jsx(Button, { type: "submit", label: "Guardar OT", loading: isSubmitting })] })] })) }) }));
};
