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
  const [error, setError] = useState<string | null>(null);
  const toast = useRef<Toast>(null);

  return (
    <div className="min-h-screen flex align-items-center justify-content-center bg-[#F6F9FF] px-3">
      <Toast ref={toast} position="top-right" />
      <Card className="w-full" style={{ maxWidth: 520, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}>
        <div className="flex flex-column align-items-center gap-3 mb-3">
          <img src={logo} alt="AutoTrack" style={{ width: 82, height: 82 }} />
          <h2 className="m-0 text-primary" style={{ letterSpacing: "0.5px" }}>
            AutoTrack
          </h2>
        </div>
        <Formik
          initialValues={{ username: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setError(null);
            try {
              await login(values);
            } catch (err) {
              setError("Credenciales inválidas");
              toast.current?.show({ severity: "error", summary: "Login", detail: "Credenciales inválidas", life: 2200 });
              console.error(err);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, handleChange, handleBlur, isSubmitting, errors, touched }) => (
            <Form className="flex flex-column gap-3">
              <div className="flex flex-column gap-1">
                <label htmlFor="username" className="text-sm text-600">
                  Usuario
                </label>
                <span className="p-input-icon-left w-full" style={{ alignItems: "center" }}>
                  <i className="pi pi-user text-500" style={{ left: "1rem" }} />
                  <InputText
                    id="username"
                    name="username"
                    autoComplete="username"
                    value={values.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full p-3 pl-5 border-round-lg bg-[#eaf0ff]"
                  />
                </span>
                {touched.username && errors.username && <small className="p-error">{errors.username}</small>}
              </div>

              <div className="flex flex-column gap-1">
                <label htmlFor="password" className="text-sm text-600">
                  Contraseña
                </label>
                <span className="p-input-icon-left w-full" style={{ alignItems: "center" }}>
                  <i className="pi pi-lock text-500" style={{ left: "1rem" }} />
                  <InputText
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full p-3 pl-5 border-round-lg bg-[#eaf0ff]"
                  />
                </span>
                {touched.password && errors.password && <small className="p-error">{errors.password}</small>}
              </div>

              {error && <small className="p-error">{error}</small>}

              <Button type="submit" label="Ingresar" loading={isSubmitting} className="w-full h-11 font-semibold" />
              <div className="text-center text-600 text-sm mt-2">¿Olvidó su contraseña?</div>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  );
};
