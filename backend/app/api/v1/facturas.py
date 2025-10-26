from datetime import datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api import deps
from app.core.deps import get_db
from app.db.models.cliente import Cliente
from app.db.models.factura import EstadoPagoEnum, Factura
from app.db.models.orden_trabajo import OrdenTrabajo
from app.db.models.vehiculo import Vehiculo
from app.schemas.factura import FacturaCreate, FacturaOut, FacturaUpdate
from app.schemas.shared import PaginatedResponse
from app.services.billing import expected_total, generate_invoice
from app.services.auditing import log_action

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[FacturaOut])
def list_facturas(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.role_required(["Admin", "Supervisor", "Facturacion"])),
    estado_pago: EstadoPagoEnum | None = Query(default=None),
    cliente: str | None = Query(default=None),
    fecha_desde: datetime | None = Query(default=None),
    fecha_hasta: datetime | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
) -> PaginatedResponse[FacturaOut]:
    query = db.query(Factura)
    if estado_pago:
        query = query.filter(Factura.estado_pago == estado_pago)
    if fecha_desde:
        query = query.filter(Factura.fecha_factura >= fecha_desde)
    if fecha_hasta:
        query = query.filter(Factura.fecha_factura <= fecha_hasta)
    if cliente:
        query = (
            query.join(Factura.orden)
            .join(OrdenTrabajo.vehiculo)
            .join(Vehiculo.cliente)
            .filter(Cliente.nombre.like(f"%{cliente}%"))
        )
    total = query.count()
    facturas = (
        query.order_by(Factura.fecha_factura.desc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )
    return PaginatedResponse[FacturaOut](
        total=total,
        items=[FacturaOut.model_validate(f) for f in facturas],
    )


@router.post("/", response_model=FacturaOut, status_code=status.HTTP_201_CREATED)
def create_factura(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.role_required(["Admin", "Facturacion"])),
    data: FacturaCreate,
) -> FacturaOut:
    orden = db.get(OrdenTrabajo, data.orden_id)
    if not orden:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Orden no encontrada")
    if not orden.lista_para_facturar and not orden.confirmada:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La orden debe estar confirmada o marcada para facturar",
        )
    monto_total = Decimal(str(data.monto_total))
    impuesto = Decimal(str(data.impuesto_aplicado))
    esperado = expected_total(orden, impuesto)
    if monto_total < esperado:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El monto total es menor al esperado",
        )
    factura = generate_invoice(
        db,
        orden=orden,
        monto_total=monto_total,
        impuesto_aplicado=impuesto,
        metodos_pago=data.metodos_pago,
        metodo_pago=data.metodo_pago,
        estado_pago=data.estado_pago,
        usuario_id=current_user.id if current_user else None,
    )
    log_action(
        db,
        usuario=current_user,
        entidad="facturas",
        entidad_id=factura.id,
        accion="CREAR",
        payload=data.model_dump(),
    )
    return FacturaOut.model_validate(factura)


@router.get("/{factura_id}", response_model=FacturaOut)
def get_factura(
    *, db: Session = Depends(get_db), current_user=Depends(deps.get_current_active_user), factura_id: int
) -> FacturaOut:
    factura = db.get(Factura, factura_id)
    if not factura:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Factura no encontrada")
    return FacturaOut.model_validate(factura)


@router.patch("/{factura_id}", response_model=FacturaOut)
def update_factura(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.role_required(["Admin", "Facturacion"])),
    factura_id: int,
    data: FacturaUpdate,
) -> FacturaOut:
    factura = db.get(Factura, factura_id)
    if not factura:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Factura no encontrada")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(factura, field, value)
    db.add(factura)
    db.commit()
    db.refresh(factura)
    log_action(
        db,
        usuario=current_user,
        entidad="facturas",
        entidad_id=factura.id,
        accion="ACTUALIZAR",
        payload=data.model_dump(exclude_unset=True),
    )
    return FacturaOut.model_validate(factura)
