from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy import and_
from sqlalchemy.orm import Session

from app.db.models.cita import Cita


def ensure_slot_available(
    db: Session, *, cliente_id: int, fecha_inicio: datetime, fecha_fin: datetime, cita_id: int | None = None
) -> None:
    solapada = (
        db.query(Cita)
        .filter(
            Cita.cliente_id == cliente_id,
            Cita.id != (cita_id or 0),
            and_(Cita.fecha_inicio < fecha_fin, Cita.fecha_fin > fecha_inicio),
        )
        .first()
    )
    if solapada:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El cliente ya tiene una cita en el horario solicitado",
        )
