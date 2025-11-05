import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Card } from "primereact/card";
import { useState } from "react";
import { useAuth } from "../../auth/useAuth";
const LoginSchema = Yup.object().shape({
    username: Yup.string().required("Usuario requerido"),
    password: Yup.string().required("Contraseña requerida"),
});
export const LoginPage = () => {
    const { login } = useAuth();
    const [error, setError] = useState(null);
    return (_jsx("div", { className: "flex align-items-center justify-content-center min-h-screen bg-primary-50", children: _jsx(Card, { title: "AutoTrack", className: "w-full md:w-4", children: _jsx(Formik, { initialValues: { username: "", password: "" }, validationSchema: LoginSchema, onSubmit: async (values, { setSubmitting }) => {
                    setError(null);
                    try {
                        await login(values);
                    }
                    catch (err) {
                        setError("Credenciales inválidas");
                        console.error(err);
                    }
                    finally {
                        setSubmitting(false);
                    }
                }, children: ({ values, handleChange, handleBlur, isSubmitting, errors, touched }) => (_jsxs(Form, { className: "flex flex-column gap-3", children: [_jsxs("span", { className: "p-float-label", children: [_jsx(InputText, { id: "username", name: "username", value: values.username, onChange: handleChange, onBlur: handleBlur }), _jsx("label", { htmlFor: "username", children: "Usuario" })] }), touched.username && errors.username && _jsx("small", { className: "p-error", children: errors.username }), _jsxs("span", { className: "p-float-label", children: [_jsx(InputText, { id: "password", name: "password", type: "password", value: values.password, onChange: handleChange, onBlur: handleBlur }), _jsx("label", { htmlFor: "password", children: "Contrase\u00F1a" })] }), touched.password && errors.password && _jsx("small", { className: "p-error", children: errors.password }), error && _jsx("small", { className: "p-error", children: error }), _jsx(Button, { type: "submit", label: "Ingresar", loading: isSubmitting })] })) }) }) }));
};
