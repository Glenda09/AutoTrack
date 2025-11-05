import { http } from "../../api/http";
import { endpoints } from "../../api/endpoints";
export const listProductos = async (params) => {
    const { data } = await http.get(endpoints.productos, { params });
    return data;
};
export const getProducto = async (id) => {
    const { data } = await http.get(`${endpoints.productos}/${id}`);
    return data;
};
export const saveProducto = async (payload) => {
    if (payload.id) {
        const { data } = await http.patch(`${endpoints.productos}/${payload.id}`, payload);
        return data;
    }
    const { data } = await http.post(endpoints.productos, payload);
    return data;
};
export const deleteProducto = async (id) => {
    await http.delete(`${endpoints.productos}/${id}`);
};
export const createPrecio = async (productoId, payload) => {
    const { data } = await http.post(endpoints.historialPrecios(productoId), payload);
    return data;
};
export const listHistorial = async (productoId) => {
    const { data } = await http.get(endpoints.historialPrecios(productoId));
    return data;
};
