from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api import deps
from app.core.deps import get_db
from app.db.models.cita import Cita, EstadoCitaEnum
from app.schemas.cita import CitaCreate, CitaOut, CitaUpdate
from app.schemas.shared import PaginatedResponse
from app.services.auditing import log_action
from app.services.scheduling import ensure_slot_available

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[CitaOut])
def list_citas(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_active_user),
    estado: EstadoCitaEnum | None = Query(default=None),
    desde: datetime | None = Query(default=None),
    hasta: datetime | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
) -> PaginatedResponse[CitaOut]:
    query = db.query(Cita)
    if estado:
        query = query.filter(Cita.estado == estado)
    if desde:
        query = query.filter(Cita.fecha_inicio >= desde)
    if hasta:
        query = query.filter(Cita.fecha_fin <= hasta)
    total = query.count()
    citas = (
        query.order_by(Cita.fecha_inicio.asc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )
    return PaginatedResponse[CitaOut](
        total=total,
        items=[CitaOut.model_validate(c) for c in citas],
    )


@router.post("/", response_model=CitaOut, status_code=status.HTTP_201_CREATED)
def create_cita(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.role_required(["Admin", "Supervisor", "Mecanico"])),
    data: CitaCreate,
) -> CitaOut:
    ensure_slot_available(
        db,
        cliente_id=data.cliente_id,
        fecha_inicio=data.fecha_inicio,
        fecha_fin=data.fecha_fin,
    )
    cita = Cita(**data.model_dump())
    db.add(cita)
    db.commit()
    db.refresh(cita)
    log_action(
        db,
        usuario=current_user,
        entidad="citas",
        entidad_id=cita.id,
        accion="CREAR",
        payload=data.model_dump(),
    )
    return CitaOut.model_validate(cita)


@router.patch("/{cita_id}", response_model=CitaOut)
def update_cita(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.role_required(["Admin", "Supervisor", "Mecanico"])),
    cita_id: int,
    data: CitaUpdate,
) -> CitaOut:
    cita = db.get(Cita, cita_id)
    if not cita:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cita no encontrada")
    payload = data.model_dump(exclude_unset=True)
    if "fecha_inicio" in payload or "fecha_fin" in payload:
        nueva_inicio = payload.get("fecha_inicio", cita.fecha_inicio)
        nueva_fin = payload.get("fecha_fin", cita.fecha_fin)
        ensure_slot_available(
            db,
            cliente_id=cita.cliente_id,
            fecha_inicio=nueva_inicio,
            fecha_fin=nueva_fin,
            cita_id=cita.id,
        )
    for field, value in payload.items():
        setattr(cita, field, value)
    db.add(cita)
    db.commit()
    db.refresh(cita)
    log_action(
        db,
        usuario=current_user,
        entidad="citas",
        entidad_id=cita.id,
        accion="ACTUALIZAR",
        payload=payload,
    )
    return CitaOut.model_validate(cita)


@router.delete("/{cita_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cita(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.role_required(["Admin", "Supervisor"])),
    cita_id: int,
) -> None:
    cita = db.get(Cita, cita_id)
    if not cita:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cita no encontrada")
    db.delete(cita)
    db.commit()
    log_action(
        db,
        usuario=current_user,
        entidad="citas",
        entidad_id=cita.id,
        accion="ELIMINAR",
        payload={"cita_id": cita_id},
    )
