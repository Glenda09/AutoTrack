import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Card } from "primereact/card";
import { http } from "../../api/http";
import { endpoints } from "../../api/endpoints";
import { format } from "date-fns";
export const DashboardPage = () => {
    const [kpis, setKpis] = useState({
        openOrders: 0,
        todayAppointments: 0,
        pendingInvoices: 0,
        lowStock: 0,
    });
    useEffect(() => {
        const loadData = async () => {
            try {
                const [otesRes, citasRes, facturasRes, productosRes] = await Promise.all([
                    http.get(endpoints.otes, { params: { estado: "Pendiente", size: 1 } }),
                    http.get(endpoints.citas, { params: { desde: format(new Date(), "yyyy-MM-dd"), hasta: format(new Date(), "yyyy-MM-dd"), size: 1 } }),
                    http.get(endpoints.facturas, { params: { estado_pago: "Pendiente", size: 1 } }),
                    http.get(endpoints.productos, { params: { size: 100 } }),
                ]);
                const lowStock = productosRes.data.items.filter((p) => p.stock_actual <= p.stock_minimo).length;
                setKpis({
                    openOrders: otesRes.data.total,
                    todayAppointments: citasRes.data.total,
                    pendingInvoices: facturasRes.data.total,
                    lowStock,
                });
            }
            catch (error) {
                console.error("Error loading dashboard data", error);
            }
        };
        loadData();
    }, []);
    const cards = [
        { title: "OT abiertas", value: kpis.openOrders, icon: "pi pi-briefcase" },
        { title: "Citas hoy", value: kpis.todayAppointments, icon: "pi pi-calendar" },
        { title: "Facturas pendientes", value: kpis.pendingInvoices, icon: "pi pi-file" },
        { title: "Stock bajo", value: kpis.lowStock, icon: "pi pi-exclamation-circle" },
    ];
    return (_jsx("div", { className: "grid", children: cards.map((card) => (_jsx("div", { className: "col-12 md:col-3", children: _jsx(Card, { children: _jsxs("div", { className: "flex align-items-center gap-3", children: [_jsx("i", { className: `${card.icon} text-4xl text-primary` }), _jsxs("div", { children: [_jsx("div", { className: "text-500", children: card.title }), _jsx("div", { className: "text-2xl font-bold", children: card.value })] })] }) }) }, card.title))) }));
};
