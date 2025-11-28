import { useEffect, useState } from "react";
import { Card } from "primereact/card";
import { addDays, format, parseISO, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { fetchKpiMensual, fetchStockBajo } from "../reportes/reportes.api";
import { http } from "../../api/http";
import { endpoints } from "../../api/endpoints";
import { Cita, listCitas } from "../citas/citas.api";

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
  const [statusCounts, setStatusCounts] = useState({ pendiente: 0, enProceso: 0, completada: 0 });
  const [monthAppointments, setMonthAppointments] = useState<Cita[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const today = new Date();
        const base = format(today, "yyyy-MM-dd");
        const [kpiMensual, stockBajo, pendientesRes, citasRes, facturasRes, enProcesoRes, completadasRes] = await Promise.all([
          fetchKpiMensual(today.getFullYear(), today.getMonth() + 1),
          fetchStockBajo(),
          http.get(endpoints.otes, { params: { estado: "Pendiente", size: 1 } }),
          http.get(endpoints.citas, { params: { desde: `${base}T00:00:00`, hasta: `${base}T23:59:59`, size: 1 } }),
          http.get(endpoints.facturas, { params: { estado_pago: "Pendiente", size: 1 } }),
          http.get(endpoints.otes, { params: { estado: "EnProceso", size: 1 } }),
          http.get(endpoints.otes, { params: { estado: "Completada", size: 1 } }),
        ]);
        setKpis({
          openOrders: kpiMensual?.ots_cerradas ?? pendientesRes.data.total,
          todayAppointments: citasRes.data.total,
          pendingInvoices: facturasRes.data.total,
          lowStock: stockBajo.length,
        });
        setStatusCounts({
          pendiente: pendientesRes.data.total ?? 0,
          enProceso: enProcesoRes.data.total ?? 0,
          completada: completadasRes.data.total ?? 0,
        });
      } catch (error) {
        console.error("Error loading dashboard data", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadUpcomingAppointments = async () => {
      try {
        const start = new Date();
        const end = addDays(start, 45);
        const data = await listCitas({
          desde: `${format(start, "yyyy-MM-dd")}T00:00:00`,
          hasta: `${format(end, "yyyy-MM-dd")}T23:59:59`,
          size: 100,
        });
        setMonthAppointments((data?.items as Cita[]) ?? []);
      } catch (error) {
        console.error("Error loading citas proximas", error);
        setMonthAppointments([]);
      }
    };

    loadUpcomingAppointments();
  }, []);

  const cards = [
    { title: "Ordenes pendientes", value: kpis.openOrders, icon: "pi pi-briefcase", color: "#F59E0B", bg: "#FEF3C7" },
    { title: "Citas hoy", value: kpis.todayAppointments, icon: "pi pi-calendar", color: "#2563EB", bg: "#E0EAFF" },
    { title: "Facturas pendientes", value: kpis.pendingInvoices, icon: "pi pi-dollar", color: "#10B981", bg: "#D1FAE5" },
    { title: "Stock bajo", value: kpis.lowStock, icon: "pi pi-box", color: "#EC4899", bg: "#FCE7F3" },
  ];

  const statusList = [
    { key: "pendiente", label: "Pendiente", color: "#F59E0B", value: statusCounts.pendiente },
    { key: "enProceso", label: "En Proceso", color: "#3B82F6", value: statusCounts.enProceso },
    { key: "completada", label: "Completada", color: "#10B981", value: statusCounts.completada },
  ];
  const totalStatus = statusList.reduce((acc, item) => acc + item.value, 0) || 1;

  const appointmentsToShow = [...monthAppointments]
    .filter((cita) => parseISO(cita.fecha_inicio).getTime() >= startOfDay(new Date()).getTime())
    .sort((a, b) => parseISO(a.fecha_inicio).getTime() - parseISO(b.fecha_inicio).getTime())
    .slice(0, 5);

  return (
    <div className="page-wrapper dashboard-page">
      <h2 className="dashboard-title">Panel de Control</h2>
      <div className="grid">
        {cards.map((card) => (
          <div key={card.title} className="col-12 md:col-4 lg:col-3">
            <Card className="shadow-1 border-round-lg dashboard-card">
              <div className="flex align-items-center justify-content-between gap-3">
                <div>
                  <div className="text-500 font-semibold">{card.title}</div>
                  <div className="text-3xl font-bold kpi-value">
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

      <div className="grid mt-3 dashboard-lower">
        <div className="col-12">
          <Card className="shadow-1 border-round-lg dashboard-card">
            <div className="panel-header">Ordenes por Estado</div>
            <div className="status-list">
              {statusList.map((status, idx) => {
                const width = Math.round((status.value / totalStatus) * 100);
                return (
                  <div key={status.key} className={`status-row ${idx === statusList.length - 1 ? "last" : ""}`}>
                    <div className="flex align-items-center gap-2 status-label">
                      <span className="status-dot" style={{ background: status.color }} />
                      <span className="text-700">{status.label}</span>
                    </div>
                    <div className="status-bar">
                      <div className="status-bar__fill" style={{ width: `${width}%`, background: status.color }} />
                    </div>
                    <span className="status-value">{status.value}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="col-12">
          <Card className="shadow-1 border-round-lg dashboard-card">
            <div className="panel-header">Proximas citas</div>
            {appointmentsToShow.length === 0 ? (
              <span className="text-500">Sin citas programadas.</span>
            ) : (
              <div className="appointments-list">
                {appointmentsToShow.map((cita) => {
                  const start = parseISO(cita.fecha_inicio);
                  const day = format(start, "dd");
                  const dayName = format(start, "EEE", { locale: es }).toUpperCase();
                  return (
                    <div key={cita.id} className="appointment-item">
                      <div className="appointment-date">
                        <span className="appointment-day">{day}</span>
                        <span className="appointment-weekday">{dayName}</span>
                      </div>
                      <div className="appointment-content">
                        <div className="appointment-title">{cita.nota || "Cita programada"}</div>
                        <small className="text-500">{format(start, "HH:mm", { locale: es })}</small>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
