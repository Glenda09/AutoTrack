import { http } from "../../api/http";
import { endpoints } from "../../api/endpoints";

export interface Factura {
  id: number;
  orden_id: number;
  monto_total: number;
  impuesto_aplicado: number;
  estado_pago: "Pagada" | "Pendiente" | "Parcial";
  metodos_pago: string[];
  metodo_pago: string;
  fecha_factura: string;
}

export const listFacturas = async (params: Record<string, unknown>) => {
  const { data } = await http.get(endpoints.facturas, { params });
  return data;
};

export const getFactura = async (id: number) => {
  const { data } = await http.get(`${endpoints.facturas}/${id}`);
  return data as Factura;
};

export const createFactura = async (payload: Partial<Factura>) => {
  const { data } = await http.post(endpoints.facturas, payload);
  return data;
};

export const updateFactura = async (id: number, payload: Partial<Factura>) => {
  const { data } = await http.patch(`${endpoints.facturas}/${id}`, payload);
  return data;
};
