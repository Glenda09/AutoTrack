import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ColumnDef, DataTable } from "../../components/UI/DataTable";
import { usePagination } from "../../hooks/usePagination";
import { useConfirm } from "../../hooks/useConfirm";
import { Cliente, deleteCliente, listClientes } from "./clientes.api";

export const ClientesList = () => {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { first, rows, currentPage, onPageChange } = usePagination();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [total, setTotal] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listClientes({ search, page: currentPage, size: rows });
      setClientes(data.items);
      setTotal(data.total);
    } catch (error) {
      console.error("Error loading clientes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, rows]);

  const columns: ColumnDef<Cliente>[] = [
    { field: "nombre", header: "Nombre" },
    { field: "telefono", header: "Teléfono" },
    { field: "email", header: "Email" },
    { field: "nit", header: "NIT" },
    {
      field: "actions",
      header: "Acciones",
      body: (row) => (
        <div className="flex gap-2">
          <Button icon="pi pi-pencil" rounded text onClick={() => navigate(`/clientes/${row.id}`)} />
          <Button
            icon="pi pi-trash"
            rounded
            text
            severity="danger"
            onClick={() =>
              confirm({
                message: "¿Eliminar cliente?",
                accept: async () => {
                  await deleteCliente(row.id);
                  load();
                },
              })
            }
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-column gap-3">
      <div className="flex align-items-center justify-content-between">
        <h2>Clientes</h2>
        <Button label="Nuevo" icon="pi pi-plus" onClick={() => navigate("/clientes/nuevo")} />
      </div>
      <div className="flex gap-2">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                load();
              }
            }}
          />
        </span>
        <Button label="Buscar" onClick={load} outlined />
      </div>
      <DataTable
        value={clientes}
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
