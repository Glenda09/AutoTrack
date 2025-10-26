from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.mysql import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class AuditLog(Base):
    __tablename__ = "audit_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    usuario_id: Mapped[int | None] = mapped_column(ForeignKey("usuarios.id"), nullable=True)
    entidad: Mapped[str] = mapped_column(String(100), nullable=False)
    entidad_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    accion: Mapped[str] = mapped_column(String(50), nullable=False)
    ts: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    usuario = relationship("Usuario", back_populates="auditorias")
