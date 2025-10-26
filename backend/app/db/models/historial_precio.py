from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class HistorialPrecio(Base):
    __tablename__ = "historial_precios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    producto_id: Mapped[int] = mapped_column(ForeignKey("productos.id"), nullable=False, index=True)
    fecha_inicio: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    fecha_fin: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    precio_unitario: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    costo_unitario: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    producto = relationship("Producto", back_populates="historial_precios")
