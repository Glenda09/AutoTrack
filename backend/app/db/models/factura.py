from datetime import datetime
from enum import Enum as PyEnum
from typing import Type

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.mysql import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def enum_values(enum_cls: Type[PyEnum]) -> list[str]:
    return [member.value for member in enum_cls]


class EstadoPagoEnum(str, PyEnum):
    PAGADA = "Pagada"
    PENDIENTE = "Pendiente"
    PARCIAL = "Parcial"


class Factura(Base):
    __tablename__ = "facturas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    orden_id: Mapped[int] = mapped_column(
        ForeignKey("ordenes_trabajo.id"), nullable=False, unique=True
    )
    fecha_factura: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    monto_total: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    impuesto_aplicado: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    metodo_pago: Mapped[str] = mapped_column(String(100), nullable=False)
    metodos_pago: Mapped[list[str]] = mapped_column(JSON, default=list)
    estado_pago: Mapped[EstadoPagoEnum] = mapped_column(
        Enum(EstadoPagoEnum, values_callable=enum_values),
        default=EstadoPagoEnum.PENDIENTE,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    orden = relationship("OrdenTrabajo", back_populates="factura")