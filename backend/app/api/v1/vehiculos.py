from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api import deps
from app.core.deps import get_db
from app.db.models.vehiculo import Vehiculo
from app.schemas.shared import PaginatedResponse
from app.schemas.vehiculo import VehiculoCreate, VehiculoOut, VehiculoUpdate
from app.services.auditing import log_action

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[VehiculoOut])
def list_vehiculos(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_active_user),
    placa: str | None = Query(default=None),
    cliente_id: int | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
) -> PaginatedResponse[VehiculoOut]:
    query = db.query(Vehiculo)
    if placa:
        query = query.filter(Vehiculo.placa.like(f"%{placa}%"))
    if cliente_id:
        query = query.filter(Vehiculo.cliente_id == cliente_id)
    total = query.count()
    vehiculos = query.order_by(Vehiculo.created_at.desc()).offset((page - 1) * size).limit(size).all()
    return PaginatedResponse[VehiculoOut](
        total=total,
        items=[VehiculoOut.model_validate(item) for item in vehiculos],
    )


@router.post("/", response_model=VehiculoOut, status_code=status.HTTP_201_CREATED)
def create_vehiculo(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_active_user),
    vehiculo_in: VehiculoCreate,
) -> VehiculoOut:
    existing = db.query(Vehiculo).filter(Vehiculo.placa == vehiculo_in.placa).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La placa ya está registrada")
    vehiculo = Vehiculo(**vehiculo_in.model_dump())
    db.add(vehiculo)
    db.commit()
    db.refresh(vehiculo)
    log_action(
        db,
        usuario=current_user,
        entidad="vehiculos",
        entidad_id=vehiculo.id,
        accion="CREAR",
        payload=vehiculo_in.model_dump(),
    )
    return VehiculoOut.model_validate(vehiculo)


@router.get("/{vehiculo_id}", response_model=VehiculoOut)
def get_vehiculo(
    *, db: Session = Depends(get_db), current_user=Depends(deps.get_current_active_user), vehiculo_id: int
) -> VehiculoOut:
    vehiculo = db.get(Vehiculo, vehiculo_id)
    if not vehiculo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehículo no encontrado")
    return VehiculoOut.model_validate(vehiculo)


@router.patch("/{vehiculo_id}", response_model=VehiculoOut)
def update_vehiculo(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_active_user),
    vehiculo_id: int,
    vehiculo_in: VehiculoUpdate,
) -> VehiculoOut:
    vehiculo = db.get(Vehiculo, vehiculo_id)
    if not vehiculo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehículo no encontrado")
    for field, value in vehiculo_in.model_dump(exclude_unset=True).items():
        setattr(vehiculo, field, value)
    db.add(vehiculo)
    db.commit()
    db.refresh(vehiculo)
    log_action(
        db,
        usuario=current_user,
        entidad="vehiculos",
        entidad_id=vehiculo.id,
        accion="ACTUALIZAR",
        payload=vehiculo_in.model_dump(exclude_unset=True),
    )
    return VehiculoOut.model_validate(vehiculo)


@router.delete("/{vehiculo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehiculo(
    *, db: Session = Depends(get_db), current_user=Depends(deps.get_current_active_user), vehiculo_id: int
) -> None:
    vehiculo = db.get(Vehiculo, vehiculo_id)
    if not vehiculo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehículo no encontrado")
    db.delete(vehiculo)
    db.commit()
    log_action(
        db,
        usuario=current_user,
        entidad="vehiculos",
        entidad_id=vehiculo.id,
        accion="ELIMINAR",
        payload={"vehiculo_id": vehiculo_id},
    )
