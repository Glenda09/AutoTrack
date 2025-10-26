import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Formik } from "formik";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { clienteSchema } from "../../utils/validators";
import { Cliente, getCliente, saveCliente } from "./clientes.api";

const tipoClienteOptions = [
  { label: "Natural", value: "Natural" },
  { label: "Jurídico", value: "Juridico" },
];

export const ClienteForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState<Partial<Cliente>>({
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

  return (
    <Card title={id ? "Editar Cliente" : "Nuevo Cliente"}>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={clienteSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await saveCliente({ ...values, id: id ? Number(id) : undefined });
            navigate("/clientes");
          } catch (error) {
            console.error("Error saving cliente", error);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, handleChange, handleBlur, errors, touched, isSubmitting, setFieldValue }) => (
          <Form className="grid formgrid p-fluid">
            <div className="field col-12 md:col-6">
              <label htmlFor="nombre">Nombre</label>
              <InputText id="nombre" name="nombre" value={values.nombre ?? ""} onChange={handleChange} onBlur={handleBlur} />
              {touched.nombre && errors.nombre && <small className="p-error">{errors.nombre}</small>}
            </div>
            <div className="field col-12 md:col-6">
              <label htmlFor="tipo_cliente">Tipo</label>
              <Dropdown
                id="tipo_cliente"
                name="tipo_cliente"
                value={values.tipo_cliente}
                options={tipoClienteOptions}
                onChange={(e) => setFieldValue("tipo_cliente", e.value)}
              />
              {touched.tipo_cliente && errors.tipo_cliente && <small className="p-error">{errors.tipo_cliente as string}</small>}
            </div>
            <div className="field col-12 md:col-6">
              <label htmlFor="telefono">Teléfono</label>
              <InputText id="telefono" name="telefono" value={values.telefono ?? ""} onChange={handleChange} onBlur={handleBlur} />
            </div>
            <div className="field col-12 md:col-6">
              <label htmlFor="email">Correo</label>
              <InputText id="email" name="email" value={values.email ?? ""} onChange={handleChange} onBlur={handleBlur} />
              {touched.email && errors.email && <small className="p-error">{errors.email}</small>}
            </div>
            <div className="field col-12 md:col-6">
              <label htmlFor="nit">NIT</label>
              <InputText id="nit" name="nit" value={values.nit ?? ""} onChange={handleChange} onBlur={handleBlur} />
            </div>
            <div className="field col-12">
              <label htmlFor="direccion">Dirección</label>
              <InputText id="direccion" name="direccion" value={values.direccion ?? ""} onChange={handleChange} onBlur={handleBlur} />
            </div>
            <div className="col-12 flex justify-content-end gap-2">
              <Button type="button" label="Cancelar" text onClick={() => navigate("/clientes")} />
              <Button type="submit" label="Guardar" loading={isSubmitting} />
            </div>
          </Form>
        )}
      </Formik>
    </Card>
  );
};
