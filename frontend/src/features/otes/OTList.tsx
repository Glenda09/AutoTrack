import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { ColumnDef, DataTable } from "../../components/UI/DataTable";
import { usePagination } from "../../hooks/usePagination";
import { useConfirm } from "../../hooks/useConfirm";
import { OrdenTrabajo, confirmarOrden, listOrdenes, marcarListaFacturar } from "./ot.api";

const estadoOptions = [
  { label: "Todos", value: "" },
  { label: "Pendiente", value: "Pendiente" },
  { label: "En Proceso", value: "EnProceso" },
  { label: "Completada", value: "Completada" },
  { label: "Entregada", value: "Entregada" },
];

const estadoSeverity: Record<string, "info" | "success" | "warning" | "danger" | "secondary"> = {
  Pendiente: "secondary",
  EnProceso: "info",
  Completada: "success",
  Entregada: "warning",
};

export const OTList = () => {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { first, rows, currentPage, onPageChange } = usePagination();
  const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>([]);
  const [total, setTotal] = useState(0);
  const [estado, setEstado] = useState<string>("");
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

  const columns: ColumnDef<OrdenTrabajo>[] = [
    { field: "id", header: "ID" },
    {
      field: "estado",
      header: "Estado",
      body: (row) => <Tag value={row.estado} severity={estadoSeverity[row.estado] ?? "secondary"} />,
    },
    {
      field: "confirmada",
      header: "Confirmada",
      body: (row) => <i className={`pi ${row.confirmada ? "pi-check-circle text-green-500" : "pi-times-circle text-red-400"}`} />,
    },
    {
      field: "lista_para_facturar",
      header: "Lista Facturar",
      body: (row) => <i className={`pi ${row.lista_para_facturar ? "pi-check" : "pi-minus"}`} />,
    },
    {
      field: "actions",
      header: "Acciones",
      body: (row) => (
        <div className="flex gap-2">
          <Button icon="pi pi-eye" text rounded onClick={() => navigate(`/otes/${row.id}`)} />
          {!row.confirmada && (
            <Button
              icon="pi pi-lock"
              text
              rounded
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
    <div className="flex flex-column gap-3">
      <div className="flex align-items-center justify-content-between">
        <h2>Órdenes de Trabajo</h2>
        <Button label="Nueva OT" icon="pi pi-plus" onClick={() => navigate("/otes/nuevo")} />
      </div>
      <div className="flex gap-2">
        <Dropdown
          value={estado}
          options={estadoOptions}
          onChange={(e) => setEstado(e.value)}
          placeholder="Estado"
        />
      </div>
      <DataTable
        value={ordenes}
        columns={columns}
        loading={loading}
        totalRecords={total}
        rows={rows}
        first={first}
        onPage={onPageChange}
      />
    </div>
  );
};
