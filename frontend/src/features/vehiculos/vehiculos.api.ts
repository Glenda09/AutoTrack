import { http } from "../../api/http";
import { endpoints } from "../../api/endpoints";

export interface Vehiculo {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  color?: string;
  cliente_id: number;
}

export const listVehiculos = async (params: Record<string, unknown>) => {
  const { data } = await http.get(endpoints.vehiculos, { params });
  return data;
};

export const getVehiculo = async (id: number) => {
  const { data } = await http.get(`${endpoints.vehiculos}/${id}`);
  return data as Vehiculo;
};

export const saveVehiculo = async (payload: Partial<Vehiculo>) => {
  if (payload.id) {
    const { data } = await http.patch(`${endpoints.vehiculos}/${payload.id}`, payload);
    return data;
  }
  const { data } = await http.post(endpoints.vehiculos, payload);
  return data;
};

export const deleteVehiculo = async (id: number) => {
  await http.delete(`${endpoints.vehiculos}/${id}`);
};
