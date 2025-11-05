import { http } from "../../api/http";
import { endpoints } from "../../api/endpoints";
export const listOrdenes = async (params) => {
    const { data } = await http.get(endpoints.otes, { params });
    return data;
};
export const getOrden = async (id) => {
    const { data } = await http.get(`${endpoints.otes}/${id}`);
    return data;
};
export const saveOrden = async (payload) => {
    if (payload.id) {
        const { data } = await http.patch(`${endpoints.otes}/${payload.id}`, payload);
        return data;
    }
    const { data } = await http.post(endpoints.otes, payload);
    return data;
};
export const addDetalle = async (ordenId, payload) => {
    const { data } = await http.post(`${endpoints.otes}/${ordenId}/detalle`, payload);
    return data;
};
export const deleteDetalle = async (ordenId, detalleId) => {
    await http.delete(`${endpoints.otes}/${ordenId}/detalle/${detalleId}`);
};
export const confirmarOrden = async (ordenId) => {
    const { data } = await http.post(endpoints.otesConfirmar(ordenId));
    return data;
};
export const marcarListaFacturar = async (ordenId) => {
    const { data } = await http.post(endpoints.otesListaFacturar(ordenId));
    return data;
};
