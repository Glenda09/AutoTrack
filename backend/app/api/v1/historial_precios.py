from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.core.deps import get_db
from app.db.models.historial_precio import HistorialPrecio
from app.db.models.producto import Producto
from app.schemas.historial_precio import HistorialPrecioCreate, HistorialPrecioOut
from app.services.auditing import log_action

router = APIRouter()


@router.get("/{producto_id}/historial-precios", response_model=list[HistorialPrecioOut])
def list_historial(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_active_user),
    producto_id: int,
) -> list[HistorialPrecioOut]:
    producto = db.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    historial = (
        db.query(HistorialPrecio)
        .filter(HistorialPrecio.producto_id == producto_id)
        .order_by(HistorialPrecio.fecha_inicio.desc())
        .all()
    )
    return [HistorialPrecioOut.model_validate(item) for item in historial]


@router.post("/{producto_id}/historial-precios", response_model=HistorialPrecioOut, status_code=status.HTTP_201_CREATED)
def create_historial(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.role_required(["Admin", "Inventario"])),
    producto_id: int,
    data: HistorialPrecioCreate,
) -> HistorialPrecioOut:
    producto = db.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    active = (
        db.query(HistorialPrecio)
        .filter(HistorialPrecio.producto_id == producto_id, HistorialPrecio.fecha_fin.is_(None))
        .order_by(HistorialPrecio.fecha_inicio.desc())
        .first()
    )
    fecha_inicio = data.fecha_inicio
    if active:
        active.fecha_fin = fecha_inicio
        db.add(active)
    nuevo = HistorialPrecio(
        producto_id=producto_id,
        fecha_inicio=fecha_inicio,
        fecha_fin=data.fecha_fin,
        precio_unitario=data.precio_unitario,
        costo_unitario=data.costo_unitario,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    log_action(
        db,
        usuario=current_user,
        entidad="historial_precios",
        entidad_id=nuevo.id,
        accion="CREAR",
        payload=data.model_dump(),
    )
    return HistorialPrecioOut.model_validate(nuevo)
