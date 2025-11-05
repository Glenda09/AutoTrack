import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import * as Yup from "yup";
import { http } from "../../api/http";
import { endpoints } from "../../api/endpoints";
const schema = Yup.object({
    username: Yup.string().required("Usuario requerido"),
    nombre_completo: Yup.string().required("Nombre requerido"),
    email: Yup.string().email("Correo inválido").nullable(),
    rol_id: Yup.number().required("Rol requerido"),
    password: Yup.string().min(6, "Mínimo 6 caracteres").nullable(),
});
export const UsuarioForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [initialValues, setInitialValues] = useState({
        username: "",
        nombre_completo: "",
        email: "",
        rol_id: null,
        password: "",
    });
    useEffect(() => {
        http.get(endpoints.roles).then((res) => setRoles(res.data.map((rol) => ({ label: rol.name, value: rol.id }))));
        if (id) {
            http.get(`${endpoints.usuarios}/${id}`).then((res) => setInitialValues({
                id: res.data.id,
                username: res.data.username,
                nombre_completo: res.data.nombre_completo,
                email: res.data.email,
                rol_id: res.data.rol_id,
                password: "",
            }));
        }
    }, [id]);
    return (_jsx(Card, { title: id ? "Editar usuario" : "Nuevo usuario", children: _jsx(Formik, { enableReinitialize: true, initialValues: initialValues, validationSchema: schema, onSubmit: async (values, { setSubmitting }) => {
                try {
                    if (values.id) {
                        await http.patch(`${endpoints.usuarios}/${values.id}`, values);
                    }
                    else {
                        await http.post(endpoints.usuarios, values);
                    }
                    navigate("/usuarios");
                }
                catch (error) {
                    console.error("Error guardando usuario", error);
                }
                finally {
                    setSubmitting(false);
                }
            }, children: ({ values, handleChange, handleBlur, errors, touched, isSubmitting, setFieldValue }) => (_jsxs(Form, { className: "grid formgrid p-fluid", children: [_jsxs("div", { className: "field col-12 md:col-4", children: [_jsx("label", { htmlFor: "username", children: "Usuario" }), _jsx(InputText, { id: "username", name: "username", value: values.username, onChange: handleChange, onBlur: handleBlur }), touched.username && errors.username && _jsx("small", { className: "p-error", children: errors.username })] }), _jsxs("div", { className: "field col-12 md:col-4", children: [_jsx("label", { htmlFor: "nombre_completo", children: "Nombre completo" }), _jsx(InputText, { id: "nombre_completo", name: "nombre_completo", value: values.nombre_completo, onChange: handleChange, onBlur: handleBlur }), touched.nombre_completo && errors.nombre_completo && _jsx("small", { className: "p-error", children: errors.nombre_completo })] }), _jsxs("div", { className: "field col-12 md:col-4", children: [_jsx("label", { htmlFor: "email", children: "Correo" }), _jsx(InputText, { id: "email", name: "email", value: values.email ?? "", onChange: handleChange, onBlur: handleBlur }), touched.email && errors.email && _jsx("small", { className: "p-error", children: errors.email })] }), _jsxs("div", { className: "field col-12 md:col-4", children: [_jsx("label", { htmlFor: "rol_id", children: "Rol" }), _jsx(Dropdown, { id: "rol_id", value: values.rol_id, options: roles, onChange: (e) => setFieldValue("rol_id", e.value), placeholder: "Seleccione" }), touched.rol_id && errors.rol_id && _jsx("small", { className: "p-error", children: errors.rol_id })] }), _jsxs("div", { className: "field col-12 md:col-4", children: [_jsx("label", { htmlFor: "password", children: id ? "Contraseña (opcional)" : "Contraseña" }), _jsx(InputText, { id: "password", name: "password", type: "password", value: values.password ?? "", onChange: handleChange, onBlur: handleBlur }), touched.password && errors.password && _jsx("small", { className: "p-error", children: errors.password })] }), _jsxs("div", { className: "col-12 flex justify-content-end gap-2", children: [_jsx(Button, { type: "button", label: "Cancelar", text: true, onClick: () => navigate("/usuarios") }), _jsx(Button, { type: "submit", label: "Guardar", loading: isSubmitting })] })] })) }) }));
};
