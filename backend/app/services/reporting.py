import csv
from io import StringIO
from typing import Iterable

from sqlalchemy import extract, func
from sqlalchemy.orm import Session

from app.db.models.detalle_orden import DetalleOrden, TipoItemEnum
from app.db.models.factura import Factura
from app.db.models.orden_trabajo import OrdenTrabajo
from app.db.models.producto import Producto
from app.db.models.usuario import Usuario


def _to_csv(headers: list[str], rows: Iterable[Iterable]) -> str:
    buffer = StringIO()
    writer = csv.writer(buffer)
    writer.writerow(headers)
    for row in rows:
        writer.writerow(row)
    return buffer.getvalue()


def ventas_mensuales(db: Session) -> str:
    results = (
        db.query(
            extract("year", Factura.fecha_factura).label("anio"),
            extract("month", Factura.fecha_factura).label("mes"),
            func.sum(Factura.monto_total).label("monto_total"),
        )
        .group_by("anio", "mes")
        .order_by("anio", "mes")
        .all()
    )
    rows = ((int(r.anio), int(r.mes), float(r.monto_total)) for r in results)
    return _to_csv(["anio", "mes", "monto_total"], rows)


def movimientos_inventario(db: Session) -> str:
    results = (
        db.query(
            OrdenTrabajo.id.label("orden_id"),
            Producto.sku,
            Producto.nombre,
            DetalleOrden.cantidad,
            DetalleOrden.precio_unitario,
            DetalleOrden.subtotal,
        )
        .join(DetalleOrden, DetalleOrden.orden_id == OrdenTrabajo.id)
        .join(Producto, Producto.id == DetalleOrden.producto_id)
        .filter(DetalleOrden.tipo_item == TipoItemEnum.REPUESTO)
        .all()
    )
    rows = (
        (
            r.orden_id,
            r.sku,
            r.nombre,
            float(r.cantidad),
            float(r.precio_unitario),
            float(r.subtotal),
        )
        for r in results
    )
    return _to_csv(["orden_id", "sku", "producto", "cantidad", "precio_unitario", "subtotal"], rows)


def rendimiento_tecnicos(db: Session) -> str:
    results = (
        db.query(
            Usuario.username,
            func.count(OrdenTrabajo.id).label("otes"),
            func.sum(OrdenTrabajo.total_estimado).label("total_estimado"),
        )
        .join(OrdenTrabajo, OrdenTrabajo.usuario_responsable_id == Usuario.id)
        .group_by(Usuario.username)
        .all()
    )
    rows = (
        (r.username, int(r.otes), float(r.total_estimado or 0))
        for r in results
    )
    return _to_csv(["usuario", "ordenes_atendidas", "total_estimado"], rows)


def estado_cartera(db: Session) -> str:
    results = (
        db.query(
            Factura.id,
            Factura.orden_id,
            Factura.estado_pago,
            Factura.monto_total,
            Factura.impuesto_aplicado,
        )
        .all()
    )
    rows = (
        (r.id, r.orden_id, r.estado_pago.value, float(r.monto_total), float(r.impuesto_aplicado))
        for r in results
    )
    return _to_csv(["factura_id", "orden_id", "estado_pago", "monto_total", "impuesto"], rows)
