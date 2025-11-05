import { http } from "../../api/http";
import { endpoints } from "../../api/endpoints";
export const listCitas = async (params) => {
    const { data } = await http.get(endpoints.citas, { params });
    return data;
};
export const createCita = async (payload) => {
    const { data } = await http.post(endpoints.citas, payload);
    return data;
};
export const updateCita = async (id, payload) => {
    const { data } = await http.patch(`${endpoints.citas}/${id}`, payload);
    return data;
};
export const deleteCita = async (id) => {
    await http.delete(`${endpoints.citas}/${id}`);
};
