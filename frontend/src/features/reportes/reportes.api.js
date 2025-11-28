import { http } from "../../api/http";
import { endpoints } from "../../api/endpoints";
export const fetchKpiMensual = async (anio, mes) => {
    const { data } = await http.get(endpoints.reportes.kpiMensual, { params: { anio, mes } });
    return data;
};
export const fetchStockBajo = async () => {
    const { data } = await http.get(endpoints.reportes.stockBajo);
    return data;
};
export const fetchOrdenesDetalladas = async (otId) => {
    const { data } = await http.get(endpoints.reportes.ordenesDetalladas, { params: { ot_id: otId } });
    return data;
};
