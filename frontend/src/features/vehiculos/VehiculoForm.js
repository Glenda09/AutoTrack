import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Formik } from "formik";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { vehiculoSchema } from "../../utils/validators";
import { listClientes } from "../clientes/clientes.api";
import { getVehiculo, saveVehiculo } from "./vehiculos.api";
export const VehiculoForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [initialValues, setInitialValues] = useState({
        placa: "",
        marca: "",
        modelo: "",
        anio: new Date().getFullYear(),
        color: "",
        cliente_id: 0,
    });
    const [clientes, setClientes] = useState([]);
    useEffect(() => {
        listClientes({ page: 1, size: 100 }).then((data) => setClientes(data.items.map((cliente) => ({ label: cliente.nombre, value: cliente.id }))));
    }, []);
    useEffect(() => {
        if (id) {
            getVehiculo(Number(id)).then((data) => setInitialValues(data));
        }
    }, [id]);
    return (_jsx(Card, { title: id ? "Editar Vehículo" : "Nuevo Vehículo", children: _jsx(Formik, { enableReinitialize: true, initialValues: initialValues, validationSchema: vehiculoSchema, onSubmit: async (values, { setSubmitting }) => {
                try {
                    await saveVehiculo({ ...values, id: id ? Number(id) : undefined });
                    navigate("/vehiculos");
                }
                catch (error) {
                    console.error("Error saving vehiculo", error);
                }
                finally {
                    setSubmitting(false);
                }
            }, children: ({ values, handleChange, handleBlur, errors, touched, isSubmitting, setFieldValue }) => (_jsxs(Form, { className: "grid formgrid p-fluid", children: [_jsxs("div", { className: "field col-12 md:col-6", children: [_jsx("label", { htmlFor: "placa", children: "Placa" }), _jsx(InputText, { id: "placa", name: "placa", value: values.placa ?? "", onChange: handleChange, onBlur: handleBlur }), touched.placa && errors.placa && _jsx("small", { className: "p-error", children: errors.placa })] }), _jsxs("div", { className: "field col-12 md:col-6", children: [_jsx("label", { htmlFor: "cliente_id", children: "Cliente" }), _jsx(Dropdown, { id: "cliente_id", value: values.cliente_id, options: clientes, onChange: (e) => setFieldValue("cliente_id", e.value), placeholder: "Seleccione" }), touched.cliente_id && errors.cliente_id && _jsx("small", { className: "p-error", children: errors.cliente_id })] }), _jsxs("div", { className: "field col-12 md:col-6", children: [_jsx("label", { htmlFor: "marca", children: "Marca" }), _jsx(InputText, { id: "marca", name: "marca", value: values.marca ?? "", onChange: handleChange, onBlur: handleBlur }), touched.marca && errors.marca && _jsx("small", { className: "p-error", children: errors.marca })] }), _jsxs("div", { className: "field col-12 md:col-6", children: [_jsx("label", { htmlFor: "modelo", children: "Modelo" }), _jsx(InputText, { id: "modelo", name: "modelo", value: values.modelo ?? "", onChange: handleChange, onBlur: handleBlur }), touched.modelo && errors.modelo && _jsx("small", { className: "p-error", children: errors.modelo })] }), _jsxs("div", { className: "field col-12 md:col-6", children: [_jsx("label", { htmlFor: "anio", children: "A\u00F1o" }), _jsx(InputText, { id: "anio", name: "anio", value: values.anio?.toString() ?? "", onChange: handleChange, onBlur: handleBlur }), touched.anio && errors.anio && _jsx("small", { className: "p-error", children: errors.anio })] }), _jsxs("div", { className: "field col-12 md:col-6", children: [_jsx("label", { htmlFor: "color", children: "Color" }), _jsx(InputText, { id: "color", name: "color", value: values.color ?? "", onChange: handleChange, onBlur: handleBlur })] }), _jsxs("div", { className: "col-12 flex justify-content-end gap-2", children: [_jsx(Button, { type: "button", label: "Cancelar", text: true, onClick: () => navigate("/vehiculos") }), _jsx(Button, { type: "submit", label: "Guardar", loading: isSubmitting })] })] })) }) }));
};
