from datetime import datetime
from enum import Enum as PyEnum
from typing import Type

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def enum_values(enum_cls: Type[PyEnum]) -> list[str]:
    return [member.value for member in enum_cls]


class EstadoCitaEnum(str, PyEnum):
    PROGRAMADA = "Programada"
    ATENDIDA = "Atendida"
    CANCELADA = "Cancelada"


class Cita(Base):
    __tablename__ = "citas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    cliente_id: Mapped[int] = mapped_column(ForeignKey("clientes.id"), nullable=False)
    vehiculo_id: Mapped[int | None] = mapped_column(ForeignKey("vehiculos.id"), nullable=True)
    fecha_inicio: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    fecha_fin: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    nota: Mapped[str | None] = mapped_column(Text)
    estado: Mapped[EstadoCitaEnum] = mapped_column(
        Enum(EstadoCitaEnum, values_callable=enum_values),
        default=EstadoCitaEnum.PROGRAMADA,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    cliente = relationship("Cliente", back_populates="citas")
    vehiculo = relationship("Vehiculo", back_populates="citas")