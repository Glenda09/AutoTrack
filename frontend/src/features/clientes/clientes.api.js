import { http } from "../../api/http";
import { endpoints } from "../../api/endpoints";
export const listClientes = async (params) => {
    const { data } = await http.get(endpoints.clientes, { params });
    return data;
};
export const getCliente = async (id) => {
    const { data } = await http.get(`${endpoints.clientes}/${id}`);
    return data;
};
export const saveCliente = async (payload) => {
    if (payload.id) {
        const { data } = await http.patch(`${endpoints.clientes}/${payload.id}`, payload);
        return data;
    }
    const { data } = await http.post(endpoints.clientes, payload);
    return data;
};
export const deleteCliente = async (id) => {
    await http.delete(`${endpoints.clientes}/${id}`);
};
