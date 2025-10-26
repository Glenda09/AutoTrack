import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Formik } from "formik";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { vehiculoSchema } from "../../utils/validators";
import { listClientes } from "../clientes/clientes.api";
import { Vehiculo, getVehiculo, saveVehiculo } from "./vehiculos.api";

interface ClienteOption {
  label: string;
  value: number;
}

export const VehiculoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState<Partial<Vehiculo>>({
    placa: "",
    marca: "",
    modelo: "",
    anio: new Date().getFullYear(),
    color: "",
    cliente_id: 0,
  });
  const [clientes, setClientes] = useState<ClienteOption[]>([]);

  useEffect(() => {
    listClientes({ page: 1, size: 100 }).then((data) =>
      setClientes(data.items.map((cliente: { id: number; nombre: string }) => ({ label: cliente.nombre, value: cliente.id })))
    );
  }, []);

  useEffect(() => {
    if (id) {
      getVehiculo(Number(id)).then((data) => setInitialValues(data));
    }
  }, [id]);

  return (
    <Card title={id ? "Editar Vehículo" : "Nuevo Vehículo"}>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={vehiculoSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await saveVehiculo({ ...values, id: id ? Number(id) : undefined });
            navigate("/vehiculos");
          } catch (error) {
            console.error("Error saving vehiculo", error);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, handleChange, handleBlur, errors, touched, isSubmitting, setFieldValue }) => (
          <Form className="grid formgrid p-fluid">
            <div className="field col-12 md:col-6">
              <label htmlFor="placa">Placa</label>
              <InputText id="placa" name="placa" value={values.placa ?? ""} onChange={handleChange} onBlur={handleBlur} />
              {touched.placa && errors.placa && <small className="p-error">{errors.placa}</small>}
            </div>
            <div className="field col-12 md:col-6">
              <label htmlFor="cliente_id">Cliente</label>
              <Dropdown
                id="cliente_id"
                value={values.cliente_id}
                options={clientes}
                onChange={(e) => setFieldValue("cliente_id", e.value)}
                placeholder="Seleccione"
              />
              {touched.cliente_id && errors.cliente_id && <small className="p-error">{errors.cliente_id as string}</small>}
            </div>
            <div className="field col-12 md:col-6">
              <label htmlFor="marca">Marca</label>
              <InputText id="marca" name="marca" value={values.marca ?? ""} onChange={handleChange} onBlur={handleBlur} />
              {touched.marca && errors.marca && <small className="p-error">{errors.marca}</small>}
            </div>
            <div className="field col-12 md:col-6">
              <label htmlFor="modelo">Modelo</label>
              <InputText id="modelo" name="modelo" value={values.modelo ?? ""} onChange={handleChange} onBlur={handleBlur} />
              {touched.modelo && errors.modelo && <small className="p-error">{errors.modelo}</small>}
            </div>
            <div className="field col-12 md:col-6">
              <label htmlFor="anio">Año</label>
              <InputText id="anio" name="anio" value={values.anio?.toString() ?? ""} onChange={handleChange} onBlur={handleBlur} />
              {touched.anio && errors.anio && <small className="p-error">{errors.anio}</small>}
            </div>
            <div className="field col-12 md:col-6">
              <label htmlFor="color">Color</label>
              <InputText id="color" name="color" value={values.color ?? ""} onChange={handleChange} onBlur={handleBlur} />
            </div>
            <div className="col-12 flex justify-content-end gap-2">
              <Button type="button" label="Cancelar" text onClick={() => navigate("/vehiculos")} />
              <Button type="submit" label="Guardar" loading={isSubmitting} />
            </div>
          </Form>
        )}
      </Formik>
    </Card>
  );
};
