from datetime import datetime

from sqlalchemy import Boolean, DateTime, Index, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Producto(Base):
    __tablename__ = "productos"
    __table_args__ = (
        Index("ix_productos_sku", "sku", unique=True),
        Index("ix_productos_nombre", "nombre"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    sku: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    nombre: Mapped[str] = mapped_column(String(150), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(String(255))
    stock_actual: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    stock_reservado: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    stock_minimo: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    ubicacion: Mapped[str | None] = mapped_column(String(100))
    proveedor_principal: Mapped[str | None] = mapped_column(String(150))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    historial_precios = relationship(
        "HistorialPrecio", back_populates="producto", cascade="all,delete"
    )
    detalles = relationship("DetalleOrden", back_populates="producto")

    def __repr__(self) -> str:
        return f"Producto(id={self.id}, sku={self.sku})"
