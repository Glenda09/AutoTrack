import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "primereact/button";
import { endpoints } from "../../api/endpoints";
import { http } from "../../api/http";
const reports = [
    { label: "Ventas mensuales", endpoint: endpoints.reportes.ventas },
    { label: "Movimientos inventario", endpoint: endpoints.reportes.inventario },
    { label: "Rendimiento técnicos", endpoint: endpoints.reportes.tecnicos },
    { label: "Estado cartera", endpoint: endpoints.reportes.cartera },
];
export const ReportesPage = () => {
    const download = async (endpoint, filename) => {
        const response = await http.get(endpoint, { responseType: "blob" });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };
    return (_jsxs("div", { className: "flex flex-column gap-3", children: [_jsx("h2", { children: "Reportes BI" }), reports.map((report) => (_jsx(Button, { label: report.label, icon: "pi pi-download", onClick: () => download(report.endpoint, `${report.label}.csv`) }, report.endpoint)))] }));
};
