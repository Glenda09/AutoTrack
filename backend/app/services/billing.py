from decimal import Decimal
from typing import Iterable

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.models.detalle_orden import DetalleOrden, TipoItemEnum
from app.db.models.factura import EstadoPagoEnum, Factura
from app.db.models.orden_trabajo import OrdenTrabajo
from app.db.models.producto import Producto
from app.services import inventory
from app.services.auditing import log_action


def _sum_detalles(detalles: Iterable[DetalleOrden]) -> Decimal:
    return sum((Decimal(str(d.subtotal)) for d in detalles), Decimal("0"))


def generate_invoice(
    db: Session,
    *,
    orden: OrdenTrabajo,
    monto_total: Decimal,
    impuesto_aplicado: Decimal,
    metodos_pago: list[str],
    metodo_pago: str,
    estado_pago: EstadoPagoEnum,
    usuario_id: int | None,
) -> Factura:
    if orden.factura:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="La orden ya posee factura"
        )
    if not orden.confirmada:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La orden debe confirmarse antes de facturar",
        )
    for detalle in orden.detalles:
        if detalle.tipo_item == TipoItemEnum.REPUESTO and detalle.producto_id:
            producto = db.get(Producto, detalle.producto_id)
            if producto:
                inventory.consume_stock(db, producto, Decimal(str(detalle.cantidad)))
    factura = Factura(
        orden_id=orden.id,
        monto_total=monto_total,
        impuesto_aplicado=impuesto_aplicado,
        metodos_pago=metodos_pago,
        metodo_pago=metodo_pago,
        estado_pago=estado_pago,
    )
    orden.lista_para_facturar = False
    db.add(factura)
    db.add(orden)
    db.commit()
    db.refresh(factura)
    log_action(
        db,
        usuario=orden.usuario_responsable if orden.usuario_responsable else None,
        entidad="facturas",
        entidad_id=factura.id,
        accion="CREAR",
        payload={"orden_id": orden.id, "monto_total": str(monto_total)},
    )
    return factura


def expected_total(orden: OrdenTrabajo, impuesto_aplicado: Decimal) -> Decimal:
    base = _sum_detalles(orden.detalles)
    return base + impuesto_aplicado
