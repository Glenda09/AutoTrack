from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Vehiculo(Base):
    __tablename__ = "vehiculos"
    __table_args__ = (Index("ix_vehiculos_placa", "placa", unique=True),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    placa: Mapped[str] = mapped_column(String(15), unique=True, nullable=False)
    marca: Mapped[str] = mapped_column(String(100), nullable=False)
    modelo: Mapped[str] = mapped_column(String(100), nullable=False)
    anio: Mapped[int] = mapped_column(Integer, nullable=False)
    color: Mapped[str | None] = mapped_column(String(50))
    cliente_id: Mapped[int] = mapped_column(ForeignKey("clientes.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    cliente = relationship("Cliente", back_populates="vehiculos")
    ordenes = relationship("OrdenTrabajo", back_populates="vehiculo")
    citas = relationship("Cita", back_populates="vehiculo")

    def __repr__(self) -> str:
        return f"Vehiculo(id={self.id}, placa={self.placa})"
