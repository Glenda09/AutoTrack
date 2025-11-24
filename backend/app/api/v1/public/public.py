from datetime import datetime, timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.db.models.cita import Cita, EstadoCitaEnum
from app.db.models.cliente import Cliente
from app.db.models.orden_trabajo import OrdenTrabajo
from app.db.models.vehiculo import Vehiculo

router = APIRouter()


@router.get("/citas/slots")
def slots_disponibles(
    desde: datetime = Query(...),
    hasta: datetime = Query(...),
    db: Session = Depends(get_db),
) -> list[dict[str, Any]]:
    """Devuelve slots disponibles de 9:00 a 17:00 evitando traslapes con citas ya registradas."""
    existing = (
        db.query(Cita)
        .filter(and_(Cita.fecha_inicio >= desde, Cita.fecha_fin <= hasta))
        .all()
    )
    slots: list[dict[str, Any]] = []
    current = desde.replace(hour=9, minute=0, second=0, microsecond=0)
    end_day = current.replace(hour=17, minute=0, second=0, microsecond=0)

    while current <= hasta:
        day_end = current.replace(hour=17, minute=0, second=0, microsecond=0)
        pointer = current
        while pointer < day_end:
            slot_end = pointer + timedelta(hours=1)
            overlap = any(
                not (slot_end <= cita.fecha_inicio or pointer >= cita.fecha_fin) for cita in existing
            )
            if not overlap:
                slots.append({"inicio": pointer.isoformat(), "fin": slot_end.isoformat()})
            pointer = slot_end
        current = (current + timedelta(days=1)).replace(hour=9, minute=0, second=0, microsecond=0)
        if current > end_day:
            end_day = current.replace(hour=17, minute=0, second=0, microsecond=0)
    return slots


@router.post("/citas/solicitud")
def solicitar_cita(
    payload: dict[str, Any],
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    cliente_id = payload.get("cliente_id")
    if not cliente_id or not db.get(Cliente, cliente_id):
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    fecha_inicio = datetime.fromisoformat(payload["fecha_inicio"])
    fecha_fin = datetime.fromisoformat(payload["fecha_fin"])
    cita = Cita(
        cliente_id=cliente_id,
        vehiculo_id=payload.get("vehiculo_id"),
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin,
        nota=payload.get("nota"),
        estado=EstadoCitaEnum.PROGRAMADA,
    )
    db.add(cita)
    db.commit()
    db.refresh(cita)
    return {"id": cita.id, "estado": cita.estado.value, "fecha_inicio": cita.fecha_inicio, "fecha_fin": cita.fecha_fin}


@router.get("/estado-vehiculo")
def estado_vehiculo(
    placa: str | None = None,
    orden: int | None = None,
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    if not placa and not orden:
        raise HTTPException(status_code=400, detail="placa u orden requeridos")
    ot_query = db.query(OrdenTrabajo).join(Vehiculo)
    if placa:
        ot_query = ot_query.filter(Vehiculo.placa == placa)
    if orden:
        ot_query = ot_query.filter(OrdenTrabajo.id == orden)
    ot = ot_query.order_by(OrdenTrabajo.created_at.desc()).first()
    if not ot:
        raise HTTPException(status_code=404, detail="No encontrado")
    vehiculo = db.get(Vehiculo, ot.vehiculo_id)
    return {
        "orden_id": ot.id,
        "estado": ot.estado.value if hasattr(ot.estado, "value") else ot.estado,
        "vehiculo": vehiculo.placa if vehiculo else None,
        "fecha_creacion": ot.fecha_creacion,
        "fecha_entrega": ot.fecha_entrega,
        "total_estimado": float(ot.total_estimado or 0),
    }

