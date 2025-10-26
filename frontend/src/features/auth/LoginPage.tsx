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
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex align-items-center justify-content-center min-h-screen bg-primary-50">
      <Card title="AutoTrack" className="w-full md:w-4">
        <Formik
          initialValues={{ username: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setError(null);
            try {
              await login(values);
            } catch (err) {
              setError("Credenciales inválidas");
              console.error(err);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, handleChange, handleBlur, isSubmitting, errors, touched }) => (
            <Form className="flex flex-column gap-3">
              <span className="p-float-label">
                <InputText
                  id="username"
                  name="username"
                  value={values.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <label htmlFor="username">Usuario</label>
              </span>
              {touched.username && errors.username && <small className="p-error">{errors.username}</small>}

              <span className="p-float-label">
                <InputText
                  id="password"
                  name="password"
                  type="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <label htmlFor="password">Contraseña</label>
              </span>
              {touched.password && errors.password && <small className="p-error">{errors.password}</small>}

              {error && <small className="p-error">{error}</small>}

              <Button type="submit" label="Ingresar" loading={isSubmitting} />
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  );
};
