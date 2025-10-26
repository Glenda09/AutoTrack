from datetime import datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.api import deps
from app.core.deps import get_db
from app.db.models.detalle_orden import DetalleOrden, TipoItemEnum
from app.db.models.historial_precio import HistorialPrecio
from app.db.models.orden_trabajo import EstadoOrdenEnum, OrdenTrabajo
from app.db.models.producto import Producto
from app.schemas.detalle_orden import DetalleOrdenCreate, DetalleOrdenOut
from app.schemas.orden_trabajo import (
    OrdenTrabajoCreate,
    OrdenTrabajoOut,
    OrdenTrabajoUpdate,
)
from app.schemas.shared import PaginatedResponse
from app.services import inventory
from app.services.auditing import log_action

router = APIRouter()


def _precio_producto_vigente(db: Session, producto_id: int) -> Decimal:
    registro = (
        db.query(HistorialPrecio)
        .filter(
            HistorialPrecio.producto_id == producto_id,
            HistorialPrecio.fecha_inicio <= datetime.utcnow(),
            or_(HistorialPrecio.fecha_fin.is_(None), HistorialPrecio.fecha_fin > datetime.utcnow()),
        )
        .order_by(HistorialPrecio.fecha_inicio.desc())
        .first()
    )
    if not registro:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Producto sin precio vigente",
        )
    return Decimal(str(registro.precio_unitario))


def _map_detalle_out(detalle: DetalleOrden) -> DetalleOrdenOut:
    return DetalleOrdenOut.model_validate(detalle)


def _map_orden_out(orden: OrdenTrabajo) -> OrdenTrabajoOut:
    data = OrdenTrabajoOut.model_validate(orden)
    data.detalles = [_map_detalle_out(detalle) for detalle in orden.detalles]
    return data


@router.get("/", response_model=PaginatedResponse[OrdenTrabajoOut])
def list_ordenes(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_active_user),
    estado: EstadoOrdenEnum | None = Query(default=None),
    desde: datetime | None = Query(default=None),
    hasta: datetime | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
) -> PaginatedResponse[OrdenTrabajoOut]:
    query = db.query(OrdenTrabajo)
    if estado:
        query = query.filter(OrdenTrabajo.estado == estado)
    if desde:
        query = query.filter(OrdenTrabajo.fecha_creacion >= desde)
    if hasta:
        query = query.filter(OrdenTrabajo.fecha_creacion <= hasta)
    total = query.count()
    ordenes = (
        query.order_by(OrdenTrabajo.fecha_creacion.desc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )
    return PaginatedResponse[OrdenTrabajoOut](
        total=total,
        items=[_map_orden_out(orden) for orden in ordenes],
    )


@router.post("/", response_model=OrdenTrabajoOut, status_code=status.HTTP_201_CREATED)
def create_orden(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.role_required(["Admin", "Supervisor", "Mecanico"])),
    orden_in: OrdenTrabajoCreate,
) -> OrdenTrabajoOut:
    orden = OrdenTrabajo(
        vehiculo_id=orden_in.vehiculo_id,
        usuario_responsable_id=orden_in.usuario_responsable_id,
        descripcion=orden_in.descripcion,
        estado=orden_in.estado,
        fecha_entrega=orden_in.fecha_entrega,
        total_estimado=orden_in.total_estimado,
    )
    db.add(orden)
    db.flush()
    total = Decimal("0")
    for detalle_in in orden_in.detalles:
        total += _agregar_detalle(db, orden, detalle_in, commit=False)
    if not orden_in.detalles and orden_in.total_estimado:
        total = Decimal(str(orden_in.total_estimado))
    orden.total_estimado = total
    db.add(orden)
    db.commit()
    db.refresh(orden)
    log_action(
        db,
        usuario=current_user,
        entidad="ordenes_trabajo",
        entidad_id=orden.id,
        accion="CREAR",
        payload=orden_in.model_dump(),
    )
    return _map_orden_out(orden)


@router.get("/{orden_id}", response_model=OrdenTrabajoOut)
def get_orden(
    *, db: Session = Depends(get_db), current_user=Depends(deps.get_current_active_user), orden_id: int
) -> OrdenTrabajoOut:
    orden = db.get(OrdenTrabajo, orden_id)
    if not orden:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Orden no encontrada")
    return _map_orden_out(orden)


@router.patch("/{orden_id}", response_model=OrdenTrabajoOut)
def update_orden(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.role_required(["Admin", "Supervisor"])),
    orden_id: int,
    orden_in: OrdenTrabajoUpdate,
) -> OrdenTrabajoOut:
    orden = db.get(OrdenTrabajo, orden_id)
    if not orden:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Orden no encontrada")
    for field, value in orden_in.model_dump(exclude_unset=True).items():
        setattr(orden, field, value)
    db.add(orden)
    db.commit()
    db.refresh(orden)
    log_action(
        db,
        usuario=current_user,
        entidad="ordenes_trabajo",
        entidad_id=orden.id,
        accion="ACTUALIZAR",
        payload=orden_in.model_dump(exclude_unset=True),
    )
    return _map_orden_out(orden)


def _agregar_detalle(
    db: Session,
    orden: OrdenTrabajo,
    detalle_in: DetalleOrdenCreate,
    *,
    commit: bool = True,
) -> Decimal:
    precio = detalle_in.precio_unitario
    if detalle_in.tipo_item == TipoItemEnum.REPUESTO:
        if not detalle_in.producto_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Producto requerido")
        if precio is None:
            precio = _precio_producto_vigente(db, detalle_in.producto_id)
    elif precio is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Precio requerido para líneas no relacionadas a repuestos",
        )
    cantidad = Decimal(str(detalle_in.cantidad))
    precio = Decimal(str(precio))
    subtotal = cantidad * precio
    detalle = DetalleOrden(
        orden_id=orden.id,
        tipo_item=detalle_in.tipo_item,
        producto_id=detalle_in.producto_id,
        descripcion=detalle_in.descripcion,
        cantidad=cantidad,
        precio_unitario=precio,
        subtotal=subtotal,
    )
    db.add(detalle)
    if commit:
        db.commit()
        db.refresh(detalle)
    return subtotal


@router.post("/{orden_id}/detalle", response_model=OrdenTrabajoOut, status_code=status.HTTP_201_CREATED)
def add_detalle(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.role_required(["Admin", "Supervisor", "Mecanico"])),
    orden_id: int,
    detalle_in: DetalleOrdenCreate,
) -> OrdenTrabajoOut:
    orden = db.get(OrdenTrabajo, orden_id)
    if not orden:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Orden no encontrada")
    subtotal = _agregar_detalle(db, orden, detalle_in, commit=True)
    orden.total_estimado = Decimal(str(orden.total_estimado)) + subtotal
    db.add(orden)
    db.commit()
    db.refresh(orden)
    log_action(
        db,
        usuario=current_user,
        entidad="ordenes_trabajo",
        entidad_id=orden.id,
        accion="AGREGAR_DETALLE",
        payload=detalle_in.model_dump(),
    )
    return _map_orden_out(orden)


@router.delete("/{orden_id}/detalle/{detalle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_detalle(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.role_required(["Admin", "Supervisor"])),
    orden_id: int,
    detalle_id: int,
) -> None:
    orden = db.get(OrdenTrabajo, orden_id)
    if not orden:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Orden no encontrada")
    detalle = db.get(DetalleOrden, detalle_id)
    if not detalle or detalle.orden_id != orden.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Detalle no encontrado")
    orden.total_estimado = max(
        Decimal(str(orden.total_estimado)) - Decimal(str(detalle.subtotal)),
        Decimal("0"),
    )
    db.delete(detalle)
    db.add(orden)
    db.commit()
    log_action(
        db,
        usuario=current_user,
        entidad="ordenes_trabajo",
        entidad_id=orden.id,
        accion="ELIMINAR_DETALLE",
        payload={"detalle_id": detalle_id},
    )


@router.post("/{orden_id}/confirmar", response_model=OrdenTrabajoOut)
def confirmar_orden(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.role_required(["Admin", "Supervisor"])),
    orden_id: int,
) -> OrdenTrabajoOut:
    orden = db.get(OrdenTrabajo, orden_id)
    if not orden:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Orden no encontrada")
    for detalle in orden.detalles:
        if detalle.tipo_item == TipoItemEnum.REPUESTO and detalle.producto_id:
            producto = inventory.ensure_stock(
                db, detalle.producto_id, Decimal(str(detalle.cantidad))
            )
            inventory.reserve_stock(db, producto, Decimal(str(detalle.cantidad)))
    orden.confirmada = True
    if orden.estado == EstadoOrdenEnum.PENDIENTE:
        orden.estado = EstadoOrdenEnum.EN_PROCESO
    db.add(orden)
    db.commit()
    db.refresh(orden)
    log_action(
        db,
        usuario=current_user,
        entidad="ordenes_trabajo",
        entidad_id=orden.id,
        accion="CONFIRMAR",
        payload={"orden_id": orden.id},
    )
    return _map_orden_out(orden)


@router.post("/{orden_id}/marcar-lista-para-facturar", response_model=OrdenTrabajoOut)
def marcar_para_facturar(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.role_required(["Admin", "Supervisor"])),
    orden_id: int,
) -> OrdenTrabajoOut:
    orden = db.get(OrdenTrabajo, orden_id)
    if not orden:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Orden no encontrada")
    if not orden.confirmada:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="La orden debe confirmarse"
        )
    orden.lista_para_facturar = True
    orden.estado = EstadoOrdenEnum.COMPLETADA
    db.add(orden)
    db.commit()
    db.refresh(orden)
    log_action(
        db,
        usuario=current_user,
        entidad="ordenes_trabajo",
        entidad_id=orden.id,
        accion="LISTA_FACTURAR",
        payload={"orden_id": orden.id},
    )
    return _map_orden_out(orden)
