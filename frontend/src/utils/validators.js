import * as Yup from "yup";
export const clienteSchema = Yup.object({
    nombre: Yup.string().min(3).required("Nombre requerido"),
    direccion: Yup.string().nullable(),
    tipo_cliente: Yup.string().oneOf(["Natural", "Juridico"]).required(),
    telefono: Yup.string().nullable(),
    email: Yup.string().email("Correo inválido").nullable(),
    nit: Yup.string().nullable(),
});
export const vehiculoSchema = Yup.object({
    placa: Yup.string().min(5, "Placa inválida").required("Placa requerida"),
    marca: Yup.string().required("Marca requerida"),
    modelo: Yup.string().required("Modelo requerido"),
    anio: Yup.number().min(1950).max(new Date().getFullYear() + 1).required("Año requerido"),
    color: Yup.string().nullable(),
    cliente_id: Yup.number().required("Cliente requerido"),
});
export const productoSchema = Yup.object({
    sku: Yup.string().required("SKU requerido"),
    nombre: Yup.string().required("Nombre requerido"),
    stock_actual: Yup.number().min(0).required(),
    stock_minimo: Yup.number().min(0).required(),
    ubicacion: Yup.string().nullable(),
    proveedor_principal: Yup.string().nullable(),
});
export const otDetalleSchema = Yup.object({
    tipo_item: Yup.string().required(),
    producto_id: Yup.number().nullable(),
    cantidad: Yup.number().positive().required(),
    precio_unitario: Yup.number().min(0).nullable(),
});
