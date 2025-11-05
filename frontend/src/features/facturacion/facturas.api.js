import { http } from "../../api/http";
import { endpoints } from "../../api/endpoints";
export const listFacturas = async (params) => {
    const { data } = await http.get(endpoints.facturas, { params });
    return data;
};
export const getFactura = async (id) => {
    const { data } = await http.get(`${endpoints.facturas}/${id}`);
    return data;
};
export const createFactura = async (payload) => {
    const { data } = await http.post(endpoints.facturas, payload);
    return data;
};
export const updateFactura = async (id, payload) => {
    const { data } = await http.patch(`${endpoints.facturas}/${id}`, payload);
    return data;
};
