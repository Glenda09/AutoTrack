import { FieldArray, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { ordenTrabajoSchema } from "./schemas";
import { getOrden, saveOrden } from "./ot.api";
import type { DetalleOrden, OrdenTrabajo } from "./ot.api";
import { listVehiculos } from "../vehiculos/vehiculos.api";
import { listProductos } from "../inventario/productos.api";
import { http } from "../../api/http";
import { endpoints } from "../../api/endpoints";

type Option = {
  label: string;
  value: number;
};

type DetalleDraft = {
  id?: number;
  tipo_item: "Repuesto" | "ManoObra" | "ServicioExterno";
  producto_id?: number | null;
  descripcion?: string;
  cantidad: number;
  precio_unitario?: number | null;
};

type OTFormValues = Omit<Partial<OrdenTrabajo>, "detalles" | "vehiculo_id" | "usuario_responsable_id"> & {
  vehiculo_id: number | null;
  usuario_responsable_id: number | null;
  detalles: DetalleDraft[];
};

export const OTForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehiculos, setVehiculos] = useState<Option[]>([]);
  const [productos, setProductos] = useState<Option[]>([]);
  const [usuarios, setUsuarios] = useState<Option[]>([]);
  const [initialValues, setInitialValues] = useState<OTFormValues>({
    vehiculo_id: null,
    usuario_responsable_id: null,
    descripcion: "",
    detalles: [
      {
        tipo_item: "ManoObra",
        descripcion: "Diagnostico",
        cantidad: 1,
        precio_unitario: 0,
        producto_id: null,
      },
    ],
  });

  useEffect(() => {
    listVehiculos({ page: 1, size: 100 }).then((data) =>
      setVehiculos(data.items.map((v: { id: number; placa: string }) => ({ label: v.placa, value: v.id })))
    );
    listProductos({ page: 1, size: 100 }).then((data) =>
      setProductos(data.items.map((p: { id: number; nombre: string }) => ({ label: p.nombre, value: p.id })))
    );
    http.get(endpoints.usuarios).then((res) =>
      setUsuarios(res.data.map((u: { id: number; nombre_completo: string }) => ({ label: u.nombre_completo, value: u.id })))
    );
    if (id) {
      getOrden(Number(id)).then((data) =>
        setInitialValues({
          id: data.id,
          vehiculo_id: data.vehiculo_id,
          usuario_responsable_id: data.usuario_responsable_id ?? null,
          descripcion: data.descripcion,
          detalles: data.detalles.map<DetalleDraft>((d) => ({
            id: d.id,
            tipo_item: d.tipo_item,
            producto_id: d.producto_id ?? null,
            descripcion: d.descripcion,
            cantidad: d.cantidad,
            precio_unitario: d.precio_unitario ?? null,
          })),
        })
      );
    }
  }, [id]);

  return (
    <Card title={id ? "Detalle OT" : "Nueva OT"}>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={ordenTrabajoSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const detallesPayload: Partial<DetalleOrden>[] = values.detalles.map((detalle) => ({
              id: detalle.id,
              tipo_item: detalle.tipo_item,
              producto_id: detalle.producto_id ?? undefined,
              descripcion: detalle.descripcion,
              cantidad: detalle.cantidad,
              precio_unitario: detalle.precio_unitario ?? undefined,
            }));
            const payload: Parameters<typeof saveOrden>[0] = {
              id: values.id,
              vehiculo_id: values.vehiculo_id ?? undefined,
              usuario_responsable_id: values.usuario_responsable_id ?? undefined,
              descripcion: values.descripcion,
              detalles: detallesPayload,
            };
            await saveOrden(payload);
            navigate("/otes");
          } catch (error) {
            console.error("Error saving OT", error);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, errors, touched, setFieldValue, isSubmitting }) => (
          <Form className="flex flex-column gap-3">
            <div className="grid formgrid">
              <div className="field col-12 md:col-4">
                <label htmlFor="vehiculo_id">Vehiculo</label>
                <Dropdown
                  id="vehiculo_id"
                  value={values.vehiculo_id}
                  options={vehiculos}
                  onChange={(e) => setFieldValue("vehiculo_id", e.value)}
                  placeholder="Seleccione"
                />
                {touched.vehiculo_id && errors.vehiculo_id && <small className="p-error">{errors.vehiculo_id as string}</small>}
              </div>
              <div className="field col-12 md:col-4">
                <label htmlFor="usuario_responsable_id">Responsable</label>
                <Dropdown
                  id="usuario_responsable_id"
                  value={values.usuario_responsable_id}
                  options={usuarios}
                  onChange={(e) => setFieldValue("usuario_responsable_id", e.value)}
                  placeholder="Seleccione"
                />
              </div>
              <div className="field col-12">
                <label htmlFor="descripcion">Descripcion</label>
                <InputText
                  id="descripcion"
                  value={values.descripcion ?? ""}
                  onChange={(e) => setFieldValue("descripcion", e.target.value)}
                />
              </div>
            </div>

            <FieldArray name="detalles">
              {({ push, remove }) => (
                <div className="flex flex-column gap-3">
                  <div className="flex justify-content-between align-items-center">
                    <h3>Lineas</h3>
                    <Button
                      type="button"
                      icon="pi pi-plus"
                      label="Agregar linea"
                      onClick={() => {
                        const nuevaLinea: DetalleDraft = {
                          tipo_item: "ManoObra",
                          descripcion: "",
                          cantidad: 1,
                          precio_unitario: 0,
                          producto_id: null,
                        };
                        push(nuevaLinea);
                      }}
                    />
                  </div>
                  {values.detalles.map((detalle, index) => {
                    const detalleErrors = (errors.detalles?.[index] ?? {}) as Record<string, string>;
                    return (
                      <Card key={index} className="p-3">
                        <div className="grid formgrid">
                          <div className="field col-12 md:col-3">
                            <label>Tipo</label>
                            <Dropdown
                              value={detalle.tipo_item}
                              options={[
                                { label: "Repuesto", value: "Repuesto" },
                                { label: "Mano de obra", value: "ManoObra" },
                                { label: "Servicio externo", value: "ServicioExterno" },
                              ]}
                              onChange={(e) => setFieldValue(`detalles[${index}].tipo_item`, e.value)}
                            />
                          </div>
                          {detalle.tipo_item === "Repuesto" && (
                            <div className="field col-12 md:col-3">
                              <label>Producto</label>
                              <Dropdown
                                value={detalle.producto_id}
                                options={productos}
                                onChange={(e) => setFieldValue(`detalles[${index}].producto_id`, e.value)}
                                placeholder="Selecciona producto"
                              />
                              {detalleErrors?.producto_id && <small className="p-error">{detalleErrors.producto_id}</small>}
                            </div>
                          )}
                          <div className="field col-12 md:col-3">
                            <label>Cantidad</label>
                            <InputText
                              value={detalle.cantidad != null ? detalle.cantidad.toString() : ""}
                              onChange={(e) => setFieldValue(`detalles[${index}].cantidad`, Number(e.target.value) || 0)}
                            />
                          </div>
                          <div className="field col-12 md:col-3">
                            <label>Precio</label>
                            <InputText
                              value={detalle.precio_unitario != null ? detalle.precio_unitario.toString() : ""}
                              disabled={detalle.tipo_item === "Repuesto"}
                              onChange={(e) =>
                                setFieldValue(
                                  `detalles[${index}].precio_unitario`,
                                  e.target.value ? Number(e.target.value) : null
                                )
                              }
                            />
                          </div>
                          <div className="field col-12">
                            <label>Descripcion</label>
                            <InputText
                              value={detalle.descripcion ?? ""}
                              onChange={(e) => setFieldValue(`detalles[${index}].descripcion`, e.target.value)}
                            />
                          </div>
                          <div className="field col-12 flex justify-content-end">
                            <Button
                              type="button"
                              icon="pi pi-trash"
                              severity="danger"
                              text
                              onClick={() => remove(index)}
                              disabled={values.detalles.length === 1}
                            />
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </FieldArray>

            <div className="flex justify-content-end gap-2">
              <Button type="button" label="Cancelar" text onClick={() => navigate("/otes")} />
              <Button type="submit" label="Guardar OT" loading={isSubmitting} />
            </div>
          </Form>
        )}
      </Formik>
    </Card>
  );
};