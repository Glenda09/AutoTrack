import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Card } from "primereact/card";
import { Toast } from "primereact/toast";
import { useRef, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import logo from "../../assets/logo autotrack.png";
const LoginSchema = Yup.object().shape({
    username: Yup.string().required("Usuario requerido"),
    password: Yup.string().required("Contraseña requerida"),
});
export const LoginPage = () => {
    const { login } = useAuth();
    const [error, setError] = useState(null);
    const toast = useRef(null);
    return (_jsxs("div", { className: "min-h-screen flex align-items-center justify-content-center bg-[#F6F9FF] px-3", children: [_jsx(Toast, { ref: toast, position: "top-right" }), _jsxs(Card, { className: "w-full", style: { maxWidth: 520, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }, children: [_jsxs("div", { className: "flex flex-column align-items-center gap-3 mb-3", children: [_jsx("img", { src: logo, alt: "AutoTrack", style: { width: 82, height: 82 } }), _jsx("h2", { className: "m-0 text-primary", style: { letterSpacing: "0.5px" }, children: "AutoTrack" })] }), _jsx(Formik, { initialValues: { username: "", password: "" }, validationSchema: LoginSchema, onSubmit: async (values, { setSubmitting }) => {
                            setError(null);
                            try {
                                await login(values);
                            }
                            catch (err) {
                                setError("Credenciales inválidas");
                                toast.current?.show({ severity: "error", summary: "Login", detail: "Credenciales inválidas", life: 2200 });
                                console.error(err);
                            }
                            finally {
                                setSubmitting(false);
                            }
                        }, children: ({ values, handleChange, handleBlur, isSubmitting, errors, touched }) => (_jsxs(Form, { className: "flex flex-column gap-3", children: [_jsxs("div", { className: "flex flex-column gap-1", children: [_jsx("label", { htmlFor: "username", className: "text-sm text-600", children: "Usuario" }), _jsxs("span", { className: "p-input-icon-left w-full", style: { alignItems: "center" }, children: [_jsx("i", { className: "pi pi-user text-500", style: { left: "1rem" } }), _jsx(InputText, { id: "username", name: "username", autoComplete: "username", value: values.username, onChange: handleChange, onBlur: handleBlur, className: "w-full p-3 pl-5 border-round-lg bg-[#eaf0ff]" })] }), touched.username && errors.username && _jsx("small", { className: "p-error", children: errors.username })] }), _jsxs("div", { className: "flex flex-column gap-1", children: [_jsx("label", { htmlFor: "password", className: "text-sm text-600", children: "Contrase\u00F1a" }), _jsxs("span", { className: "p-input-icon-left w-full", style: { alignItems: "center" }, children: [_jsx("i", { className: "pi pi-lock text-500", style: { left: "1rem" } }), _jsx(InputText, { id: "password", name: "password", type: "password", autoComplete: "current-password", value: values.password, onChange: handleChange, onBlur: handleBlur, className: "w-full p-3 pl-5 border-round-lg bg-[#eaf0ff]" })] }), touched.password && errors.password && _jsx("small", { className: "p-error", children: errors.password })] }), error && _jsx("small", { className: "p-error", children: error }), _jsx(Button, { type: "submit", label: "Ingresar", loading: isSubmitting, className: "w-full h-11 font-semibold" }), _jsx("div", { className: "text-center text-600 text-sm mt-2", children: "\u00BFOlvid\u00F3 su contrase\u00F1a?" })] })) })] })] }));
};
