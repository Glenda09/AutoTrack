from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api import deps
from app.core.deps import get_db
from app.db.models.cliente import Cliente
from app.schemas.cliente import ClienteCreate, ClienteOut, ClienteUpdate
from app.schemas.shared import PaginatedResponse
from app.services.auditing import log_action

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[ClienteOut])
def list_clientes(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_active_user),
    search: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
) -> PaginatedResponse[ClienteOut]:
    query = db.query(Cliente)
    if search:
        like = f"%{search}%"
        query = query.filter(
            or_(
                Cliente.nombre.like(like),
                Cliente.telefono.like(like),
                Cliente.nit.like(like),
            )
        )
    total = query.count()
    clientes = query.order_by(Cliente.created_at.desc()).offset((page - 1) * size).limit(size).all()
    return PaginatedResponse[ClienteOut](
        total=total,
        items=[ClienteOut.model_validate(cliente) for cliente in clientes],
    )


@router.post("/", response_model=ClienteOut, status_code=status.HTTP_201_CREATED)
def create_cliente(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_active_user),
    cliente_in: ClienteCreate,
) -> ClienteOut:
    cliente = Cliente(**cliente_in.model_dump())
    db.add(cliente)
    db.commit()
    db.refresh(cliente)
    log_action(
        db,
        usuario=current_user,
        entidad="clientes",
        entidad_id=cliente.id,
        accion="CREAR",
        payload=cliente_in.model_dump(),
    )
    return ClienteOut.model_validate(cliente)


@router.get("/{cliente_id}", response_model=ClienteOut)
def get_cliente(
    *, db: Session = Depends(get_db), current_user=Depends(deps.get_current_active_user), cliente_id: int
) -> ClienteOut:
    cliente = db.get(Cliente, cliente_id)
    if not cliente:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente no encontrado")
    return ClienteOut.model_validate(cliente)


@router.patch("/{cliente_id}", response_model=ClienteOut)
def update_cliente(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_active_user),
    cliente_id: int,
    cliente_in: ClienteUpdate,
) -> ClienteOut:
    cliente = db.get(Cliente, cliente_id)
    if not cliente:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente no encontrado")
    for field, value in cliente_in.model_dump(exclude_unset=True).items():
        setattr(cliente, field, value)
    db.add(cliente)
    db.commit()
    db.refresh(cliente)
    log_action(
        db,
        usuario=current_user,
        entidad="clientes",
        entidad_id=cliente.id,
        accion="ACTUALIZAR",
        payload=cliente_in.model_dump(exclude_unset=True),
    )
    return ClienteOut.model_validate(cliente)


@router.delete("/{cliente_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cliente(
    *, db: Session = Depends(get_db), current_user=Depends(deps.get_current_active_user), cliente_id: int
) -> None:
    cliente = db.get(Cliente, cliente_id)
    if not cliente:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente no encontrado")
    db.delete(cliente)
    db.commit()
    log_action(
        db,
        usuario=current_user,
        entidad="clientes",
        entidad_id=cliente.id,
        accion="ELIMINAR",
        payload={"cliente_id": cliente_id},
    )
