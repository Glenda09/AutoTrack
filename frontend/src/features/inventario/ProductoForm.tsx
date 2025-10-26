import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Formik } from "formik";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { formatDate } from "../../utils/formatters";
import { productoSchema } from "../../utils/validators";
import { createPrecio, getProducto, listHistorial, saveProducto } from "./productos.api";

interface ProductoFormValues {
  id?: number;
  sku: string;
  nombre: string;
  descripcion?: string;
  stock_actual: number;
  stock_minimo: number;
  ubicacion?: string;
  proveedor_principal?: string;
}

export const ProductoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState<ProductoFormValues>({
    sku: "",
    nombre: "",
    descripcion: "",
    stock_actual: 0,
    stock_minimo: 0,
    ubicacion: "",
    proveedor_principal: "",
  });
  const [historial, setHistorial] = useState<Array<{ id: number; fecha_inicio: string; precio_unitario: string; costo_unitario: string }>>([]);
  const [priceForm, setPriceForm] = useState({ precio_unitario: "", costo_unitario: "" });

  useEffect(() => {
    if (id) {
      getProducto(Number(id)).then((data) => {
        setInitialValues({
          id: data.id,
          sku: data.sku,
          nombre: data.nombre,
          descripcion: data.descripcion,
          stock_actual: data.stock_actual,
          stock_minimo: data.stock_minimo,
          ubicacion: data.ubicacion,
          proveedor_principal: data.proveedor_principal,
        });
        listHistorial(Number(id)).then(setHistorial);
      });
    }
  }, [id]);

  const handleCreatePrice = async () => {
    if (!id) return;
    await createPrecio(Number(id), {
      fecha_inicio: new Date().toISOString(),
      precio_unitario: priceForm.precio_unitario,
      costo_unitario: priceForm.costo_unitario,
    });
    setPriceForm({ precio_unitario: "", costo_unitario: "" });
    const updated = await listHistorial(Number(id));
    setHistorial(updated);
  };

  return (
    <div className="flex flex-column gap-4">
      <Card title={id ? "Editar Producto" : "Nuevo Producto"}>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={productoSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await saveProducto(values);
              navigate("/inventario");
            } catch (error) {
              console.error("Error saving producto", error);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, handleChange, handleBlur, errors, touched, isSubmitting }) => (
            <Form className="grid formgrid p-fluid">
              <div className="field col-12 md:col-4">
                <label htmlFor="sku">SKU</label>
                <InputText id="sku" name="sku" value={values.sku} onChange={handleChange} onBlur={handleBlur} />
                {touched.sku && errors.sku && <small className="p-error">{errors.sku}</small>}
              </div>
              <div className="field col-12 md:col-8">
                <label htmlFor="nombre">Nombre</label>
                <InputText id="nombre" name="nombre" value={values.nombre} onChange={handleChange} onBlur={handleBlur} />
                {touched.nombre && errors.nombre && <small className="p-error">{errors.nombre}</small>}
              </div>
              <div className="field col-12">
                <label htmlFor="descripcion">Descripción</label>
                <InputText id="descripcion" name="descripcion" value={values.descripcion ?? ""} onChange={handleChange} onBlur={handleBlur} />
              </div>
              <div className="field col-12 md:col-4">
                <label htmlFor="stock_actual">Stock actual</label>
                <InputText
                  id="stock_actual"
                  name="stock_actual"
                  value={values.stock_actual?.toString() ?? "0"}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.stock_actual && errors.stock_actual && <small className="p-error">{errors.stock_actual}</small>}
              </div>
              <div className="field col-12 md:col-4">
                <label htmlFor="stock_minimo">Stock mínimo</label>
                <InputText
                  id="stock_minimo"
                  name="stock_minimo"
                  value={values.stock_minimo?.toString() ?? "0"}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.stock_minimo && errors.stock_minimo && <small className="p-error">{errors.stock_minimo}</small>}
              </div>
              <div className="field col-12 md:col-4">
                <label htmlFor="ubicacion">Ubicación</label>
                <InputText id="ubicacion" name="ubicacion" value={values.ubicacion ?? ""} onChange={handleChange} onBlur={handleBlur} />
              </div>
              <div className="field col-12 md:col-6">
                <label htmlFor="proveedor_principal">Proveedor</label>
                <InputText
                  id="proveedor_principal"
                  name="proveedor_principal"
                  value={values.proveedor_principal ?? ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>
              <div className="col-12 flex justify-content-end gap-2">
                <Button type="button" label="Cancelar" text onClick={() => navigate("/inventario")} />
                <Button type="submit" label="Guardar" loading={isSubmitting} />
              </div>
            </Form>
          )}
        </Formik>
      </Card>

      {id && (
        <Card title="Historial de precios">
          <div className="flex gap-2 mb-3">
            <InputText
              placeholder="Precio unitario"
              value={priceForm.precio_unitario}
              onChange={(e) => setPriceForm((prev) => ({ ...prev, precio_unitario: e.target.value }))}
            />
            <InputText
              placeholder="Costo unitario"
              value={priceForm.costo_unitario}
              onChange={(e) => setPriceForm((prev) => ({ ...prev, costo_unitario: e.target.value }))}
            />
            <Button label="Actualizar precio" onClick={handleCreatePrice} disabled={!priceForm.precio_unitario} />
          </div>
          <DataTable value={historial} rows={5} paginator>
            <Column field="fecha_inicio" header="Vigencia" body={(row) => formatDate(row.fecha_inicio)} />
            <Column field="precio_unitario" header="Precio" />
            <Column field="costo_unitario" header="Costo" />
          </DataTable>
        </Card>
      )}
    </div>
  );
};
