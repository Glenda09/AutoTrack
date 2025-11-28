import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { format, parseISO } from "date-fns";
import { ColumnDef, DataTable } from "../../components/UI/DataTable";
import { usePagination } from "../../hooks/usePagination";
import { useConfirm } from "../../hooks/useConfirm";
import { OrdenTrabajo, confirmarOrden, listOrdenes, marcarListaFacturar } from "./ot.api";

const estadoOptions = [
  { label: "Todos los estados", value: "" },
  { label: "Pendiente", value: "Pendiente" },
  { label: "En Proceso", value: "EnProceso" },
  { label: "Completada", value: "Completada" },
  { label: "Entregada", value: "Entregada" },
];

export const OTList = () => {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { first, rows, currentPage, onPageChange } = usePagination();
  const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>([]);
  const [total, setTotal] = useState(0);
  const [estado, setEstado] = useState<string>("");
  const [search, setSearch] = useState("");
  const [fecha, setFecha] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page: currentPage, size: rows };
      if (estado) params.estado = estado;
      const data = await listOrdenes(params);
      setOrdenes(data.items);
      setTotal(data.total);
    } catch (error) {
      console.error("Error loading OT", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, rows, estado]);

  const filteredOrdenes = useMemo(() => {
    return ordenes.filter((ot) => {
      const term = search.toLowerCase().trim();
      if (term) {
        const hayMatch =
          `${ot.id}`.includes(term) ||
          (ot.descripcion ?? "").toLowerCase().includes(term) ||
          ((ot as any).cliente_nombre ?? "").toLowerCase().includes(term) ||
          ((ot as any).vehiculo_placa ?? "").toLowerCase().includes(term) ||
          ((ot as any).vehiculo_modelo ?? "").toLowerCase().includes(term);
        if (!hayMatch) return false;
      }
      if (fecha) {
        const target = new Date(fecha);
        const base = (ot as any).fecha_creacion ?? (ot as any).created_at;
        if (base) {
          const parsed = parseISO(base);
          const sameDay =
            parsed.getFullYear() === target.getFullYear() &&
            parsed.getMonth() === target.getMonth() &&
            parsed.getDate() === target.getDate();
          if (!sameDay) return false;
        }
      }
      return true;
    });
  }, [ordenes, search, fecha]);

  const formatDate = (value?: string) => {
    if (!value) return "-";
    try {
      const parsed = parseISO(value);
      return format(parsed, "yyyy-MM-dd");
    } catch (error) {
      return value;
    }
  };

  const formatCurrency = (value?: number | null) => {
    if (value === undefined || value === null) return "-";
    const numeric = typeof value === "string" ? Number(value) : value;
    if (Number.isNaN(numeric)) return "-";
    return `$${numeric.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getTotal = (row: OrdenTrabajo) => {
    const maybeTotal = (row as any).total_estimado ?? (row as any).total ?? null;
    if (typeof maybeTotal === "number") return maybeTotal;
    if (Array.isArray(row.detalles)) {
      return row.detalles.reduce((acc, det) => acc + (det.subtotal ?? 0), 0);
    }
    return null;
  };

  const estadoClass = (estadoValue: string) => {
    const key = (estadoValue ?? "").toLowerCase();
    if (key === "pendiente") return "status-pill status-pendiente";
    if (key === "enproceso" || key === "en proceso") return "status-pill status-enproceso";
    if (key === "completada" || key === "completa") return "status-pill status-completada";
    if (key === "entregada" || key === "entregado") return "status-pill status-entregada";
    return "status-pill";
  };

  const columns: ColumnDef<OrdenTrabajo>[] = [
    {
      field: "id",
      header: "No. de Orden",
      body: (row) => <span className="ot-id">#{row.id}</span>,
    },
    {
      field: "cliente",
      header: "Cliente",
      body: (row) => (row as any).cliente_nombre ?? (row as any).cliente?.nombre ?? "-",
    },
    {
      field: "vehiculo",
      header: "Vehículo",
      body: (row) =>
        (row as any).vehiculo_placa ??
        (row as any).vehiculo_modelo ??
        (row as any).vehiculo?.placa ??
        (row as any).vehiculo?.modelo ??
        "-",
    },
    {
      field: "fecha_creacion",
      header: "Fecha creación",
      body: (row) => formatDate((row as any).fecha_creacion ?? (row as any).created_at),
    },
    {
      field: "estado",
      header: "Estado",
      body: (row) => <span className={estadoClass(row.estado)}>{row.estado}</span>,
    },
    {
      field: "total",
      header: "Total estimado",
      body: (row) => formatCurrency(getTotal(row)),
    },
    {
      field: "actions",
      header: "Acciones",
      body: (row) => (
        <div className="flex gap-1">
          <Button icon="pi pi-pencil" text rounded severity="secondary" onClick={() => navigate(`/otes/${row.id}`)} />
          {!row.confirmada && (
            <Button
              icon="pi pi-lock"
              text
              rounded
              severity="secondary"
              onClick={() =>
                confirm({
                  message: "Confirmar orden y reservar inventario?",
                  accept: async () => {
                    await confirmarOrden(row.id);
                    load();
                  },
                })
              }
            />
          )}
          {row.confirmada && !row.lista_para_facturar && (
            <Button
              icon="pi pi-flag"
              text
              rounded
              severity="secondary"
              onClick={() =>
                confirm({
                  message: "Marcar como lista para facturar?",
                  accept: async () => {
                    await marcarListaFacturar(row.id);
                    load();
                  },
                })
              }
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="ot-page">
      <div className="ot-header">
        <h2>Órdenes de Trabajo</h2>
        <Button label="Nueva Orden de Trabajo" icon="pi pi-plus" onClick={() => navigate("/otes/nuevo")} />
      </div>
      <div className="ot-panel">
        <div className="ot-filters">
          <span className="p-input-icon-left w-full">
            <i className="pi pi-search" />
            <InputText
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por No. de Orden, Cliente, Vehículo..."
              className="w-full ot-search"
            />
          </span>
          <Dropdown value={estado} options={estadoOptions} onChange={(e) => setEstado(e.value)} placeholder="Todos los estados" className="w-full" />
          <Calendar
            value={fecha}
            onChange={(e) => setFecha(e.value as Date)}
            placeholder="mm/dd/yyyy"
            showIcon
            dateFormat="mm/dd/yy"
            className="w-full"
          />
        </div>
        <div className="ot-table">
          <DataTable
            value={filteredOrdenes}
            columns={columns}
            loading={loading}
            totalRecords={filteredOrdenes.length || total}
            rows={rows}
            first={first}
            onPage={onPageChange}
            className="ot-datatable"
            tableStyle={{ minWidth: "100%" }}
          />
        </div>
      </div>
    </div>
  );
};
