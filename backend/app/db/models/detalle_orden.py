from enum import Enum as PyEnum
from typing import Type

from sqlalchemy import Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def enum_values(enum_cls: Type[PyEnum]) -> list[str]:
    return [member.value for member in enum_cls]


class TipoItemEnum(str, PyEnum):
    REPUESTO = "Repuesto"
    MANO_OBRA = "ManoObra"
    SERVICIO_EXTERNO = "ServicioExterno"


class DetalleOrden(Base):
    __tablename__ = "detalle_orden"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    orden_id: Mapped[int] = mapped_column(ForeignKey("ordenes_trabajo.id"), nullable=False)
    tipo_item: Mapped[TipoItemEnum] = mapped_column(
        Enum(TipoItemEnum, values_callable=enum_values), nullable=False
    )
    producto_id: Mapped[int | None] = mapped_column(ForeignKey("productos.id"), nullable=True)
    descripcion: Mapped[str | None] = mapped_column(String(255))
    cantidad: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    precio_unitario: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    subtotal: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    orden = relationship("OrdenTrabajo", back_populates="detalles")
    producto = relationship("Producto", back_populates="detalles")