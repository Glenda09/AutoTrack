import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { Factura, getFactura, updateFactura } from "./facturas.api";

const estadoOptions = [
  { label: "Pagada", value: "Pagada" },
  { label: "Pendiente", value: "Pendiente" },
  { label: "Parcial", value: "Parcial" },
];

export const FacturaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [factura, setFactura] = useState<Factura | null>(null);
  const [monto, setMonto] = useState("");
  const [estado, setEstado] = useState<Factura["estado_pago"]>("Pagada");

  useEffect(() => {
    if (id) {
      getFactura(Number(id)).then((data) => {
        setFactura(data);
        setMonto(data.monto_total.toString());
        setEstado(data.estado_pago);
      });
    }
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    await updateFactura(Number(id), { monto_total: Number(monto), estado_pago: estado });
    navigate("/facturacion");
  };

  if (!factura) {
    return <div>Cargando...</div>;
  }

  return (
    <Card title={`Factura #${factura.id}`}>
      <div className="grid formgrid">
        <div className="field col-12 md:col-4">
          <label>Orden</label>
          <div>{factura.orden_id}</div>
        </div>
        <div className="field col-12 md:col-4">
          <label>Fecha</label>
          <div>{formatDate(factura.fecha_factura)}</div>
        </div>
        <div className="field col-12 md:col-4">
          <label>Método de pago</label>
          <div>{factura.metodo_pago}</div>
        </div>
        <div className="field col-12 md:col-4">
          <label>Monto total</label>
          <InputText value={monto} onChange={(e) => setMonto(e.target.value)} />
        </div>
        <div className="field col-12 md:col-4">
          <label>Estado</label>
          <Dropdown value={estado} options={estadoOptions} onChange={(e) => setEstado(e.value)} />
        </div>
        <div className="field col-12 md:col-4">
          <label>Impuesto</label>
          <div>{formatCurrency(factura.impuesto_aplicado)}</div>
        </div>
      </div>
      <div className="flex justify-content-end gap-2">
        <Button label="Volver" text onClick={() => navigate("/facturacion")} />
        <Button label="Guardar" onClick={handleSave} />
      </div>
    </Card>
  );
};
