import { http } from "../../api/http";
import { endpoints } from "../../api/endpoints";

export interface Producto {
  id: number;
  sku: string;
  nombre: string;
  descripcion?: string;
  stock_actual: number;
  stock_minimo: number;
  stock_reservado?: number;
  ubicacion?: string;
  proveedor_principal?: string;
}

export const listProductos = async (params: Record<string, unknown>) => {
  const { data } = await http.get(endpoints.productos, { params });
  return data;
};

export const getProducto = async (id: number) => {
  const { data } = await http.get(`${endpoints.productos}/${id}`);
  return data as Producto;
};

export const saveProducto = async (payload: Partial<Producto>) => {
  if (payload.id) {
    const { data } = await http.patch(`${endpoints.productos}/${payload.id}`, payload);
    return data;
  }
  const { data } = await http.post(endpoints.productos, payload);
  return data;
};

export const deleteProducto = async (id: number) => {
  await http.delete(`${endpoints.productos}/${id}`);
};

export const createPrecio = async (productoId: number, payload: { fecha_inicio: string; precio_unitario: string; costo_unitario: string }) => {
  const { data } = await http.post(endpoints.historialPrecios(productoId), payload);
  return data;
};

export const listHistorial = async (productoId: number) => {
  const { data } = await http.get(endpoints.historialPrecios(productoId));
  return data as Array<{ id: number; fecha_inicio: string; precio_unitario: string; costo_unitario: string }>;
};