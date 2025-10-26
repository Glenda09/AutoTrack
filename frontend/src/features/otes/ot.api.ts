import { http } from "../../api/http";
import { endpoints } from "../../api/endpoints";

export interface OrdenTrabajo {
  id: number;
  vehiculo_id: number | null;
  usuario_responsable_id?: number | null;
  descripcion?: string;
  estado: string;
  lista_para_facturar: boolean;
  confirmada: boolean;
  detalles: DetalleOrden[];
}

export interface DetalleOrden {
  id: number;
  tipo_item: "Repuesto" | "ManoObra" | "ServicioExterno";
  producto_id?: number;
  descripcion?: string;
  cantidad: number;
  precio_unitario?: number;
  subtotal: number;
}

export type OrdenTrabajoPayload = Partial<Omit<OrdenTrabajo, "detalles">> & {
  detalles?: Partial<DetalleOrden>[];
};

export const listOrdenes = async (params: Record<string, unknown>) => {
  const { data } = await http.get(endpoints.otes, { params });
  return data;
};

export const getOrden = async (id: number) => {
  const { data } = await http.get(`${endpoints.otes}/${id}`);
  return data as OrdenTrabajo;
};

export const saveOrden = async (payload: OrdenTrabajoPayload) => {
  if (payload.id) {
    const { data } = await http.patch(`${endpoints.otes}/${payload.id}`, payload);
    return data;
  }
  const { data } = await http.post(endpoints.otes, payload);
  return data;
};

export const addDetalle = async (ordenId: number, payload: Partial<DetalleOrden>) => {
  const { data } = await http.post(`${endpoints.otes}/${ordenId}/detalle`, payload);
  return data;
};

export const deleteDetalle = async (ordenId: number, detalleId: number) => {
  await http.delete(`${endpoints.otes}/${ordenId}/detalle/${detalleId}`);
};

export const confirmarOrden = async (ordenId: number) => {
  const { data } = await http.post(endpoints.otesConfirmar(ordenId));
  return data;
};

export const marcarListaFacturar = async (ordenId: number) => {
  const { data } = await http.post(endpoints.otesListaFacturar(ordenId));
  return data;
};