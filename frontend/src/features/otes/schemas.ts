import * as Yup from "yup";

export const detalleSchema = Yup.object({
  tipo_item: Yup.string().required(),
  producto_id: Yup.number().nullable(),
  cantidad: Yup.number().positive().required(),
  precio_unitario: Yup.number().nullable(),
});

export const ordenTrabajoSchema = Yup.object({
  vehiculo_id: Yup.number().required("Seleccione un vehículo"),
  usuario_responsable_id: Yup.number().nullable(),
  descripcion: Yup.string().nullable(),
  detalles: Yup.array().of(detalleSchema).min(1, "Agrega al menos un detalle"),
});
