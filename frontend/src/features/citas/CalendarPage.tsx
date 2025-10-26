import { useEffect, useState } from "react";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { ColumnDef, DataTable } from "../../components/UI/DataTable";
import { listClientes } from "../clientes/clientes.api";
import { listVehiculos } from "../vehiculos/vehiculos.api";
import { Cita, createCita, deleteCita, listCitas, updateCita } from "./citas.api";
import { formatDate } from "../../utils/formatters";
import { useConfirm } from "../../hooks/useConfirm";

export const CalendarPage = () => {
  const confirm = useConfirm();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [citas, setCitas] = useState<Cita[]>([]);
  const [clientes, setClientes] = useState<Array<{ label: string; value: number }>>([]);
  const [vehiculos, setVehiculos] = useState<Array<{ label: string; value: number }>>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({
    cliente_id: 0,
    vehiculo_id: 0,
    fecha_inicio: "",
    fecha_fin: "",
    nota: "",
  });

  const load = async (date: Date | null) => {
    if (!date) return;
    const desde = date.toISOString().split("T")[0];
    const data = await listCitas({ desde, hasta: desde, size: 100 });
    setCitas(data.items);
  };

  useEffect(() => {
    listClientes({ page: 1, size: 100 }).then((data) =>
      setClientes(data.items.map((c: { id: number; nombre: string }) => ({ label: c.nombre, value: c.id })))
    );
    listVehiculos({ page: 1, size: 100 }).then((data) =>
      setVehiculos(data.items.map((v: { id: number; placa: string }) => ({ label: v.placa, value: v.id })))
    );
  }, []);

  useEffect(() => {
    load(selectedDate);
  }, [selectedDate]);

  const columns: ColumnDef<Cita>[] = [
    { field: "fecha_inicio", header: "Inicio", body: (row) => formatDate(row.fecha_inicio) },
    { field: "fecha_fin", header: "Fin", body: (row) => formatDate(row.fecha_fin) },
    { field: "nota", header: "Nota" },
    { field: "estado", header: "Estado" },
    {
      field: "actions",
      header: "Acciones",
      body: (row) => (
        <div className="flex gap-2">
          <Button
            icon="pi pi-check"
            text
            rounded
            onClick={() => updateCita(row.id, { estado: "Atendida" }).then(() => load(selectedDate))}
          />
          <Button
            icon="pi pi-trash"
            text
            rounded
            severity="danger"
            onClick={() =>
              confirm({
                message: "¿Eliminar cita?",
                accept: async () => {
                  await deleteCita(row.id);
                  load(selectedDate);
                },
              })
            }
          />
        </div>
      ),
    },
  ];

  const openDialog = () => {
    if (!selectedDate) return;
    const iso = selectedDate.toISOString().split("T")[0];
    setForm({
      cliente_id: 0,
      vehiculo_id: 0,
      fecha_inicio: `${iso}T09:00`,
      fecha_fin: `${iso}T10:00`,
      nota: "",
    });
    setShowDialog(true);
  };

  const submit = async () => {
    await createCita({
      cliente_id: form.cliente_id,
      vehiculo_id: form.vehiculo_id || undefined,
      fecha_inicio: form.fecha_inicio,
      fecha_fin: form.fecha_fin,
      nota: form.nota,
    });
    setShowDialog(false);
    load(selectedDate);
  };

  return (
    <div className="flex flex-column gap-3">
      <div className="flex align-items-center justify-content-between">
        <h2>Citas</h2>
        <Button label="Nueva cita" icon="pi pi-plus" onClick={openDialog} />
      </div>
      <Calendar value={selectedDate} onChange={(e) => setSelectedDate(e.value as Date)} inline />
      <DataTable value={citas} columns={columns} rows={10} />

      <Dialog header="Nueva cita" visible={showDialog} onHide={() => setShowDialog(false)} style={{ width: "32rem" }}>
        <div className="flex flex-column gap-3">
          <Dropdown
            value={form.cliente_id}
            options={clientes}
            onChange={(e) => setForm((prev) => ({ ...prev, cliente_id: e.value }))}
            placeholder="Cliente"
          />
          <Dropdown
            value={form.vehiculo_id}
            options={vehiculos}
            onChange={(e) => setForm((prev) => ({ ...prev, vehiculo_id: e.value }))}
            placeholder="Vehículo"
            showClear
          />
          <InputTextarea
            autoResize
            rows={3}
            placeholder="Nota"
            value={form.nota}
            onChange={(e) => setForm((prev) => ({ ...prev, nota: e.target.value }))}
          />
          <Button label="Guardar" onClick={submit} disabled={!form.cliente_id} />
        </div>
      </Dialog>
    </div>
  );
};
