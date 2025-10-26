import { http } from "../../api/http";
import { endpoints } from "../../api/endpoints";

export interface Cliente {
  id: number;
  nombre: string;
  direccion?: string;
  tipo_cliente: "Natural" | "Juridico";
  telefono?: string;
  email?: string;
  nit?: string;
}

export interface ClienteFilters {
  search?: string;
  page?: number;
  size?: number;
}

export const listClientes = async (params: ClienteFilters) => {
  const { data } = await http.get(endpoints.clientes, { params });
  return data;
};

export const getCliente = async (id: number) => {
  const { data } = await http.get(`${endpoints.clientes}/${id}`);
  return data as Cliente;
};

export const saveCliente = async (payload: Partial<Cliente>) => {
  if (payload.id) {
    const { data } = await http.patch(`${endpoints.clientes}/${payload.id}`, payload);
    return data;
  }
  const { data } = await http.post(endpoints.clientes, payload);
  return data;
};

export const deleteCliente = async (id: number) => {
  await http.delete(`${endpoints.clientes}/${id}`);
};
