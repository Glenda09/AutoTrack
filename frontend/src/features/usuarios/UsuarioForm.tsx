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

interface UsuarioFormValues {
  id?: number;
  username: string;
  nombre_completo: string;
  email?: string;
  rol_id: number | null;
  password?: string;
}

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
  const [roles, setRoles] = useState<Array<{ label: string; value: number }>>([]);
  const [initialValues, setInitialValues] = useState<UsuarioFormValues>({
    username: "",
    nombre_completo: "",
    email: "",
    rol_id: null,
    password: "",
  });

  useEffect(() => {
    http.get(endpoints.roles).then((res) =>
      setRoles(res.data.map((rol: { id: number; name: string }) => ({ label: rol.name, value: rol.id })))
    );
    if (id) {
      http.get(`${endpoints.usuarios}/${id}`).then((res) =>
        setInitialValues({
          id: res.data.id,
          username: res.data.username,
          nombre_completo: res.data.nombre_completo,
          email: res.data.email,
          rol_id: res.data.rol_id,
          password: "",
        })
      );
    }
  }, [id]);

  return (
    <Card title={id ? "Editar usuario" : "Nuevo usuario"}>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={schema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            if (values.id) {
              await http.patch(`${endpoints.usuarios}/${values.id}`, values);
            } else {
              await http.post(endpoints.usuarios, values);
            }
            navigate("/usuarios");
          } catch (error) {
            console.error("Error guardando usuario", error);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, handleChange, handleBlur, errors, touched, isSubmitting, setFieldValue }) => (
          <Form className="grid formgrid p-fluid">
            <div className="field col-12 md:col-4">
              <label htmlFor="username">Usuario</label>
              <InputText id="username" name="username" value={values.username} onChange={handleChange} onBlur={handleBlur} />
              {touched.username && errors.username && <small className="p-error">{errors.username}</small>}
            </div>
            <div className="field col-12 md:col-4">
              <label htmlFor="nombre_completo">Nombre completo</label>
              <InputText
                id="nombre_completo"
                name="nombre_completo"
                value={values.nombre_completo}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.nombre_completo && errors.nombre_completo && <small className="p-error">{errors.nombre_completo}</small>}
            </div>
            <div className="field col-12 md:col-4">
              <label htmlFor="email">Correo</label>
              <InputText id="email" name="email" value={values.email ?? ""} onChange={handleChange} onBlur={handleBlur} />
              {touched.email && errors.email && <small className="p-error">{errors.email}</small>}
            </div>
            <div className="field col-12 md:col-4">
              <label htmlFor="rol_id">Rol</label>
              <Dropdown
                id="rol_id"
                value={values.rol_id}
                options={roles}
                onChange={(e) => setFieldValue("rol_id", e.value)}
                placeholder="Seleccione"
              />
              {touched.rol_id && errors.rol_id && <small className="p-error">{errors.rol_id as string}</small>}
            </div>
            <div className="field col-12 md:col-4">
              <label htmlFor="password">{id ? "Contraseña (opcional)" : "Contraseña"}</label>
              <InputText
                id="password"
                name="password"
                type="password"
                value={values.password ?? ""}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.password && errors.password && <small className="p-error">{errors.password}</small>}
            </div>
            <div className="col-12 flex justify-content-end gap-2">
              <Button type="button" label="Cancelar" text onClick={() => navigate("/usuarios")} />
              <Button type="submit" label="Guardar" loading={isSubmitting} />
            </div>
          </Form>
        )}
      </Formik>
    </Card>
  );
};
