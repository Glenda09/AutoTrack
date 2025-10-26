import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ColumnDef, DataTable } from "../../components/UI/DataTable";
import { usePagination } from "../../hooks/usePagination";
import { useConfirm } from "../../hooks/useConfirm";
import { Vehiculo, deleteVehiculo, listVehiculos } from "./vehiculos.api";

export const VehiculosList = () => {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { first, rows, currentPage, onPageChange } = usePagination();
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [total, setTotal] = useState(0);
  const [placa, setPlaca] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listVehiculos({ placa, page: currentPage, size: rows });
      setVehiculos(data.items);
      setTotal(data.total);
    } catch (error) {
      console.error("Error loading vehiculos", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, rows]);

  const columns: ColumnDef<Vehiculo>[] = [
    { field: "placa", header: "Placa" },
    { field: "marca", header: "Marca" },
    { field: "modelo", header: "Modelo" },
    { field: "anio", header: "Año" },
    {
      field: "actions",
      header: "Acciones",
      body: (row) => (
        <div className="flex gap-2">
          <Button icon="pi pi-pencil" rounded text onClick={() => navigate(`/vehiculos/${row.id}`)} />
          <Button
            icon="pi pi-trash"
            rounded
            text
            severity="danger"
            onClick={() =>
              confirm({
                message: "¿Eliminar vehículo?",
                accept: async () => {
                  await deleteVehiculo(row.id);
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
        <h2>Vehículos</h2>
        <Button label="Nuevo" icon="pi pi-plus" onClick={() => navigate("/vehiculos/nuevo")} />
      </div>
      <div className="flex gap-2">
        <InputText
          placeholder="Filtrar por placa"
          value={placa}
          onChange={(e) => setPlaca(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
        />
        <Button label="Buscar" onClick={load} outlined />
      </div>
      <DataTable
        value={vehiculos}
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
