from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api import deps
from app.core.deps import get_db
from app.db.models.producto import Producto
from app.schemas.producto import ProductoCreate, ProductoOut, ProductoUpdate
from app.schemas.shared import PaginatedResponse
from app.services.auditing import log_action

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[ProductoOut])
def list_productos(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_active_user),
    search: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
) -> PaginatedResponse[ProductoOut]:
    query = db.query(Producto)
    if search:
        like = f"%{search}%"
        query = query.filter((Producto.nombre.like(like)) | (Producto.sku.like(like)))
    total = query.count()
    productos = query.order_by(Producto.nombre.asc()).offset((page - 1) * size).limit(size).all()
    return PaginatedResponse[ProductoOut](
        total=total,
        items=[ProductoOut.model_validate(p) for p in productos],
    )


@router.post("/", response_model=ProductoOut, status_code=status.HTTP_201_CREATED)
def create_producto(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.role_required(["Admin", "Inventario"])),
    producto_in: ProductoCreate,
) -> ProductoOut:
    existing = db.query(Producto).filter(Producto.sku == producto_in.sku).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El SKU ya existe")
    producto = Producto(**producto_in.model_dump())
    db.add(producto)
    db.commit()
    db.refresh(producto)
    log_action(
        db,
        usuario=current_user,
        entidad="productos",
        entidad_id=producto.id,
        accion="CREAR",
        payload=producto_in.model_dump(),
    )
    return ProductoOut.model_validate(producto)


@router.get("/{producto_id}", response_model=ProductoOut)
def get_producto(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_active_user),
    producto_id: int,
) -> ProductoOut:
    producto = db.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    return ProductoOut.model_validate(producto)


@router.patch("/{producto_id}", response_model=ProductoOut)
def update_producto(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.role_required(["Admin", "Inventario"])),
    producto_id: int,
    producto_in: ProductoUpdate,
) -> ProductoOut:
    producto = db.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    for field, value in producto_in.model_dump(exclude_unset=True).items():
        setattr(producto, field, value)
    db.add(producto)
    db.commit()
    db.refresh(producto)
    log_action(
        db,
        usuario=current_user,
        entidad="productos",
        entidad_id=producto.id,
        accion="ACTUALIZAR",
        payload=producto_in.model_dump(exclude_unset=True),
    )
    return ProductoOut.model_validate(producto)


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_producto(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.role_required(["Admin", "Inventario"])),
    producto_id: int,
) -> None:
    producto = db.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    db.delete(producto)
    db.commit()
    log_action(
        db,
        usuario=current_user,
        entidad="productos",
        entidad_id=producto.id,
        accion="ELIMINAR",
        payload={"producto_id": producto_id},
    )
