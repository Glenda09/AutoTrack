from datetime import datetime
from enum import Enum as PyEnum
from typing import Type

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def enum_values(enum_cls: Type[PyEnum]) -> list[str]:
    return [member.value for member in enum_cls]


class EstadoOrdenEnum(str, PyEnum):
    PENDIENTE = "Pendiente"
    EN_PROCESO = "EnProceso"
    COMPLETADA = "Completada"
    ENTREGADA = "Entregada"


class OrdenTrabajo(Base):
    __tablename__ = "ordenes_trabajo"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    vehiculo_id: Mapped[int] = mapped_column(ForeignKey("vehiculos.id"), nullable=False)
    usuario_responsable_id: Mapped[int | None] = mapped_column(
        ForeignKey("usuarios.id"), nullable=True
    )
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    descripcion: Mapped[str | None] = mapped_column(Text)
    estado: Mapped[EstadoOrdenEnum] = mapped_column(
        Enum(EstadoOrdenEnum, values_callable=enum_values),
        default=EstadoOrdenEnum.PENDIENTE,
        nullable=False,
    )
    fecha_entrega: Mapped[datetime | None] = mapped_column(DateTime)
    total_estimado: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    lista_para_facturar: Mapped[bool] = mapped_column(Boolean, default=False)
    confirmada: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    vehiculo = relationship("Vehiculo", back_populates="ordenes")
    usuario_responsable = relationship("Usuario", back_populates="ordenes")
    detalles = relationship(
        "DetalleOrden", back_populates="orden", cascade="all,delete-orphan"
    )
    factura = relationship("Factura", back_populates="orden", uselist=False)

    def __repr__(self) -> str:
        return f"OrdenTrabajo(id={self.id}, estado={self.estado})"