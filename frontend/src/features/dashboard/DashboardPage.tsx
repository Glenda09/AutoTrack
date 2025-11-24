import { useEffect, useState } from "react";
import { Card } from "primereact/card";
import { format } from "date-fns";
import { fetchKpiMensual, fetchStockBajo } from "../reportes/reportes.api";
import { http } from "../../api/http";
import { endpoints } from "../../api/endpoints";

interface KPIState {
  openOrders: number;
  todayAppointments: number;
  pendingInvoices: number;
  lowStock: number;
}

export const DashboardPage = () => {
  const [kpis, setKpis] = useState<KPIState>({
    openOrders: 0,
    todayAppointments: 0,
    pendingInvoices: 0,
    lowStock: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const today = new Date();
        const base = format(today, "yyyy-MM-dd");
        const [kpiMensual, stockBajo, otesRes, citasRes, facturasRes] = await Promise.all([
          fetchKpiMensual(today.getFullYear(), today.getMonth() + 1),
          fetchStockBajo(),
          http.get(endpoints.otes, { params: { estado: "Pendiente", size: 1 } }),
          http.get(endpoints.citas, { params: { desde: `${base}T00:00:00`, hasta: `${base}T23:59:59`, size: 1 } }),
          http.get(endpoints.facturas, { params: { estado_pago: "Pendiente", size: 1 } }),
        ]);
        setKpis({
          openOrders: kpiMensual?.ots_cerradas ?? otesRes.data.total,
          todayAppointments: citasRes.data.total,
          pendingInvoices: facturasRes.data.total,
          lowStock: stockBajo.length,
        });
      } catch (error) {
        console.error("Error loading dashboard data", error);
      }
    };
    loadData();
  }, []);

  const cards = [
    { title: "Ordenes pendientes", value: kpis.openOrders, icon: "pi pi-briefcase", color: "#F59E0B", bg: "#FEF3C7" },
    { title: "Citas hoy", value: kpis.todayAppointments, icon: "pi pi-calendar", color: "#2563EB", bg: "#E0EAFF" },
    { title: "Facturas pendientes", value: kpis.pendingInvoices, icon: "pi pi-dollar", color: "#10B981", bg: "#D1FAE5" },
    { title: "Stock bajo", value: kpis.lowStock, icon: "pi pi-box", color: "#EC4899", bg: "#FCE7F3" },
  ];

  return (
    <div className="page-wrapper">
      <h2 className="mb-4" style={{ color: "#111827" }}>
        Panel de Control
      </h2>
      <div className="grid">
        {cards.map((card) => (
          <div key={card.title} className="col-12 md:col-3">
            <Card className="shadow-1 border-round-lg" style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}>
              <div className="flex align-items-center justify-content-between gap-3">
                <div>
                  <div className="text-500 font-semibold">{card.title}</div>
                  <div className="text-3xl font-bold" style={{ color: "#0f172a" }}>
                    {card.value}
                  </div>
                </div>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: "50%",
                    background: card.bg,
                    color: card.color,
                  }}
                  className="flex align-items-center justify-content-center text-xl"
                >
                  <i className={card.icon} />
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};
