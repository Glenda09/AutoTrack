from datetime import datetime
from enum import Enum as PyEnum
from typing import Type

from sqlalchemy import Boolean, DateTime, Enum, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def enum_values(enum_cls: Type[PyEnum]) -> list[str]:
    return [member.value for member in enum_cls]


class TipoClienteEnum(str, PyEnum):
    NATURAL = "Natural"
    JURIDICO = "Juridico"


class Cliente(Base):
    __tablename__ = "clientes"
    __table_args__ = (
        Index("ix_clientes_nombre", "nombre"),
        Index("ix_clientes_telefono", "telefono"),
        Index("ix_clientes_nit", "nit"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(150), nullable=False)
    direccion: Mapped[str | None] = mapped_column(String(255))
    tipo_cliente: Mapped[TipoClienteEnum] = mapped_column(
        Enum(TipoClienteEnum, values_callable=enum_values), nullable=False
    )
    telefono: Mapped[str | None] = mapped_column(String(50))
    email: Mapped[str | None] = mapped_column(String(150))
    nit: Mapped[str | None] = mapped_column(String(50))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    vehiculos = relationship("Vehiculo", back_populates="cliente", cascade="all,delete")
    citas = relationship("Cita", back_populates="cliente")

    def __repr__(self) -> str:
        return f"Cliente(id={self.id}, nombre={self.nombre})"