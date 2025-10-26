from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.models.producto import Producto


def _to_decimal(value: Decimal | float | int) -> Decimal:
    return Decimal(str(value))


def ensure_stock(db: Session, producto_id: int, cantidad: Decimal) -> Producto:
    producto = db.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    disponible = _to_decimal(producto.stock_actual) - _to_decimal(producto.stock_reservado)
    if disponible < cantidad:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stock insuficiente para {producto.nombre}. Disponible {disponible}",
        )
    return producto


def reserve_stock(db: Session, producto: Producto, cantidad: Decimal) -> None:
    producto.stock_reservado = _to_decimal(producto.stock_reservado) + cantidad
    db.add(producto)
    db.commit()
    db.refresh(producto)


def release_reservation(db: Session, producto: Producto, cantidad: Decimal) -> None:
    producto.stock_reservado = max(
        _to_decimal(producto.stock_reservado) - cantidad,
        Decimal("0"),
    )
    db.add(producto)
    db.commit()
    db.refresh(producto)


def consume_stock(db: Session, producto: Producto, cantidad: Decimal) -> None:
    producto.stock_reservado = max(
        _to_decimal(producto.stock_reservado) - cantidad,
        Decimal("0"),
    )
    producto.stock_actual = _to_decimal(producto.stock_actual) - cantidad
    if producto.stock_actual < 0:
        producto.stock_actual = Decimal("0")
    db.add(producto)
    db.commit()
    db.refresh(producto)
