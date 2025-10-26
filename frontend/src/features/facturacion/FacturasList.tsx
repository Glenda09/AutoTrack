import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { ColumnDef, DataTable } from "../../components/UI/DataTable";
import { usePagination } from "../../hooks/usePagination";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { createFactura, Factura, listFacturas } from "./facturas.api";

const estadoOptions = [
  { label: "Todos", value: "" },
  { label: "Pagada", value: "Pagada" },
  { label: "Pendiente", value: "Pendiente" },
  { label: "Parcial", value: "Parcial" },
];

export const FacturasList = () => {
  const navigate = useNavigate();
  const { first, rows, currentPage, onPageChange } = usePagination();
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [total, setTotal] = useState(0);
  const [estado, setEstado] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ orden_id: "", monto_total: "", impuesto_aplicado: "", metodo_pago: "Efectivo" });

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page: currentPage, size: rows };
      if (estado) params.estado_pago = estado;
      const data = await listFacturas(params);
      setFacturas(data.items);
      setTotal(data.total);
    } catch (error) {
      console.error("Error loading facturas", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, rows, estado]);

  const submitFactura = async () => {
    try {
      await createFactura({
        orden_id: Number(form.orden_id),
        monto_total: Number(form.monto_total),
        impuesto_aplicado: Number(form.impuesto_aplicado || 0),
        metodos_pago: [form.metodo_pago],
        metodo_pago: form.metodo_pago,
        estado_pago: "Pagada",
      });
      setShowDialog(false);
      setForm({ orden_id: "", monto_total: "", impuesto_aplicado: "", metodo_pago: "Efectivo" });
      load();
    } catch (error) {
      console.error("Error creando factura", error);
    }
  };

  const columns: ColumnDef<Factura>[] = [
    { field: "id", header: "#" },
    {
      field: "fecha_factura",
      header: "Fecha",
      body: (row) => formatDate(row.fecha_factura),
    },
    { field: "orden_id", header: "OT" },
    {
      field: "monto_total",
      header: "Total",
      body: (row) => formatCurrency(row.monto_total),
    },
    {
      field: "estado_pago",
      header: "Estado",
      body: (row) => <Tag value={row.estado_pago} severity={row.estado_pago === "Pagada" ? "success" : "warning"} />,
    },
    {
      field: "actions",
      header: "Acciones",
      body: (row) => (
        <Button icon="pi pi-eye" text rounded onClick={() => navigate(`/facturacion/${row.id}`)} />
      ),
    },
  ];

  return (
    <div className="flex flex-column gap-3">
      <div className="flex align-items-center justify-content-between">
        <h2>Facturación</h2>
        <Button label="Nueva factura" icon="pi pi-plus" onClick={() => setShowDialog(true)} />
      </div>
      <div className="flex gap-2 align-items-center">
        <Dropdown value={estado} options={estadoOptions} onChange={(e) => setEstado(e.value)} placeholder="Estado" />
      </div>
      <DataTable
        value={facturas}
        columns={columns}
        loading={loading}
        totalRecords={total}
        rows={rows}
        first={first}
        onPage={onPageChange}
      />

      <Dialog header="Nueva factura" visible={showDialog} onHide={() => setShowDialog(false)} style={{ width: "30rem" }}>
        <div className="flex flex-column gap-3">
          <span className="p-float-label">
            <InputText
              id="orden"
              value={form.orden_id}
              onChange={(e) => setForm((prev) => ({ ...prev, orden_id: e.target.value }))}
            />
            <label htmlFor="orden">ID de OT</label>
          </span>
          <span className="p-float-label">
            <InputText
              id="monto"
              value={form.monto_total}
              onChange={(e) => setForm((prev) => ({ ...prev, monto_total: e.target.value }))}
            />
            <label htmlFor="monto">Monto total</label>
          </span>
          <span className="p-float-label">
            <InputText
              id="impuesto"
              value={form.impuesto_aplicado}
              onChange={(e) => setForm((prev) => ({ ...prev, impuesto_aplicado: e.target.value }))}
            />
            <label htmlFor="impuesto">Impuesto aplicado</label>
          </span>
          <span className="p-float-label">
            <InputText
              id="metodo"
              value={form.metodo_pago}
              onChange={(e) => setForm((prev) => ({ ...prev, metodo_pago: e.target.value }))}
            />
            <label htmlFor="metodo">Método de pago</label>
          </span>
          <Button label="Crear" onClick={submitFactura} disabled={!form.orden_id || !form.monto_total} />
        </div>
      </Dialog>
    </div>
  );
};
