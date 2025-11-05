import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Formik } from "formik";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { clienteSchema } from "../../utils/validators";
import { getCliente, saveCliente } from "./clientes.api";
const tipoClienteOptions = [
    { label: "Natural", value: "Natural" },
    { label: "Jurídico", value: "Juridico" },
];
export const ClienteForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [initialValues, setInitialValues] = useState({
        nombre: "",
        direccion: "",
        tipo_cliente: "Natural",
        telefono: "",
        email: "",
        nit: "",
    });
    useEffect(() => {
        if (id) {
            getCliente(Number(id)).then((data) => setInitialValues(data));
        }
    }, [id]);
    return (_jsx(Card, { title: id ? "Editar Cliente" : "Nuevo Cliente", children: _jsx(Formik, { enableReinitialize: true, initialValues: initialValues, validationSchema: clienteSchema, onSubmit: async (values, { setSubmitting }) => {
                try {
                    await saveCliente({ ...values, id: id ? Number(id) : undefined });
                    navigate("/clientes");
                }
                catch (error) {
                    console.error("Error saving cliente", error);
                }
                finally {
                    setSubmitting(false);
                }
            }, children: ({ values, handleChange, handleBlur, errors, touched, isSubmitting, setFieldValue }) => (_jsxs(Form, { className: "grid formgrid p-fluid", children: [_jsxs("div", { className: "field col-12 md:col-6", children: [_jsx("label", { htmlFor: "nombre", children: "Nombre" }), _jsx(InputText, { id: "nombre", name: "nombre", value: values.nombre ?? "", onChange: handleChange, onBlur: handleBlur }), touched.nombre && errors.nombre && _jsx("small", { className: "p-error", children: errors.nombre })] }), _jsxs("div", { className: "field col-12 md:col-6", children: [_jsx("label", { htmlFor: "tipo_cliente", children: "Tipo" }), _jsx(Dropdown, { id: "tipo_cliente", name: "tipo_cliente", value: values.tipo_cliente, options: tipoClienteOptions, onChange: (e) => setFieldValue("tipo_cliente", e.value) }), touched.tipo_cliente && errors.tipo_cliente && _jsx("small", { className: "p-error", children: errors.tipo_cliente })] }), _jsxs("div", { className: "field col-12 md:col-6", children: [_jsx("label", { htmlFor: "telefono", children: "Tel\u00E9fono" }), _jsx(InputText, { id: "telefono", name: "telefono", value: values.telefono ?? "", onChange: handleChange, onBlur: handleBlur })] }), _jsxs("div", { className: "field col-12 md:col-6", children: [_jsx("label", { htmlFor: "email", children: "Correo" }), _jsx(InputText, { id: "email", name: "email", value: values.email ?? "", onChange: handleChange, onBlur: handleBlur }), touched.email && errors.email && _jsx("small", { className: "p-error", children: errors.email })] }), _jsxs("div", { className: "field col-12 md:col-6", children: [_jsx("label", { htmlFor: "nit", children: "NIT" }), _jsx(InputText, { id: "nit", name: "nit", value: values.nit ?? "", onChange: handleChange, onBlur: handleBlur })] }), _jsxs("div", { className: "field col-12", children: [_jsx("label", { htmlFor: "direccion", children: "Direcci\u00F3n" }), _jsx(InputText, { id: "direccion", name: "direccion", value: values.direccion ?? "", onChange: handleChange, onBlur: handleBlur })] }), _jsxs("div", { className: "col-12 flex justify-content-end gap-2", children: [_jsx(Button, { type: "button", label: "Cancelar", text: true, onClick: () => navigate("/clientes") }), _jsx(Button, { type: "submit", label: "Guardar", loading: isSubmitting })] })] })) }) }));
};
