import { http } from "../../api/http";
import { endpoints } from "../../api/endpoints";
export const listVehiculos = async (params) => {
    const { data } = await http.get(endpoints.vehiculos, { params });
    return data;
};
export const getVehiculo = async (id) => {
    const { data } = await http.get(`${endpoints.vehiculos}/${id}`);
    return data;
};
export const saveVehiculo = async (payload) => {
    if (payload.id) {
        const { data } = await http.patch(`${endpoints.vehiculos}/${payload.id}`, payload);
        return data;
    }
    const { data } = await http.post(endpoints.vehiculos, payload);
    return data;
};
export const deleteVehiculo = async (id) => {
    await http.delete(`${endpoints.vehiculos}/${id}`);
};
