import { http } from "../../api/http";
import { endpoints } from "../../api/endpoints";

export interface Cita {
  id: number;
  cliente_id: number;
  vehiculo_id?: number;
  fecha_inicio: string;
  fecha_fin: string;
  nota?: string;
  estado: "Programada" | "Atendida" | "Cancelada";
}

export const listCitas = async (params: Record<string, unknown>) => {
  const { data } = await http.get(endpoints.citas, { params });
  return data;
};

export const createCita = async (payload: Partial<Cita>) => {
  const { data } = await http.post(endpoints.citas, payload);
  return data;
};

export const updateCita = async (id: number, payload: Partial<Cita>) => {
  const { data } = await http.patch(`${endpoints.citas}/${id}`, payload);
  return data;
};

export const deleteCita = async (id: number) => {
  await http.delete(`${endpoints.citas}/${id}`);
};
