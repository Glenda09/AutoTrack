from datetime import date, datetime
from decimal import Decimal
from typing import Any, Mapping

from fastapi import APIRouter, Depends, Response
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api import deps
from app.core.deps import get_db
from app.services import reporting

router = APIRouter()


def _coerce_row(row: Mapping[str, Any]) -> dict[str, Any]:
    parsed: dict[str, Any] = {}
    for key, value in row.items():
        if isinstance(value, Decimal):
            parsed[key] = float(value)
        elif isinstance(value, (datetime, date)):
            parsed[key] = value.isoformat()
        else:
            parsed[key] = value
    return parsed


def _csv_response(filename: str, content: str) -> Response:
    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/kpi-mensual")
def kpi_mensual(
    anio: int,
    mes: int,
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.role_required(["Admin", "Facturacion"])),
) -> dict[str, Any]:
    kpi_rows = db.execute(
        text(
            """
            SELECT anio, mes, total_facturado, ots_cerradas, repuestos_usados, ticket_promedio
            FROM vw_kpi_mensual
            WHERE anio = :anio AND mes = :mes
            """
        ),
        {"anio": anio, "mes": mes},
    ).mappings().all()
    kpi = _coerce_row(kpi_rows[0]) if kpi_rows else {
        "anio": anio,
        "mes": mes,
        "total_facturado": 0,
        "ots_cerradas": 0,
        "repuestos_usados": 0,
        "ticket_promedio": 0,
    }
    ingresos_fn = db.execute(
        text("SELECT fn_kpi_ingresos_mes(:anio, :mes) AS ingresos"),
        {"anio": anio, "mes": mes},
    ).scalar()
    kpi["ingresos_funcion"] = float(ingresos_fn or 0)
    return kpi


@router.get("/stock-bajo")
def stock_bajo(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.role_required(["Admin", "Inventario"])),
) -> list[dict[str, Any]]:
    rows = db.execute(
        text(
            """
            SELECT producto_id, sku, nombre, stock_actual, stock_minimo, ultima_fecha_movimiento, dias_sin_movimiento
            FROM vw_stock_bajo
            """
        )
    ).mappings().all()
    return [_coerce_row(row) for row in rows]


@router.get("/ordenes-detalladas")
def ordenes_detalladas(
    ot_id: int | None = None,
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.role_required(["Admin", "Supervisor", "Facturacion"])),
) -> list[dict[str, Any]]:
    base_sql = """
        SELECT ot_id, placa, cliente_nombre, estado, subtotal_linea, total_ot, dias_abierta
        FROM vw_ordenes_detalladas
    """
    params: dict[str, Any] = {}
    if ot_id is not None:
        base_sql += " WHERE ot_id = :ot_id"
        params["ot_id"] = ot_id
    rows = db.execute(text(base_sql), params).mappings().all()
    return [_coerce_row(row) for row in rows]


@router.get("/ventas-mensuales.csv")
def ventas_mensuales(
    *, db: Session = Depends(get_db), current_user=Depends(deps.role_required(["Admin", "Facturacion"]))
) -> Response:
    return _csv_response("ventas-mensuales.csv", reporting.ventas_mensuales(db))


@router.get("/movimientos-inventario.csv")
def movimientos_inventario(
    *, db: Session = Depends(get_db), current_user=Depends(deps.role_required(["Admin", "Inventario"]))
) -> Response:
    return _csv_response("movimientos-inventario.csv", reporting.movimientos_inventario(db))


@router.get("/rendimiento-tecnicos.csv")
def rendimiento_tecnicos(
    *, db: Session = Depends(get_db), current_user=Depends(deps.role_required(["Admin", "Supervisor"]))
) -> Response:
    return _csv_response("rendimiento-tecnicos.csv", reporting.rendimiento_tecnicos(db))


@router.get("/estado-cartera.csv")
def estado_cartera(
    *, db: Session = Depends(get_db), current_user=Depends(deps.role_required(["Admin", "Facturacion"]))
) -> Response:
    return _csv_response("estado-cartera.csv", reporting.estado_cartera(db))
