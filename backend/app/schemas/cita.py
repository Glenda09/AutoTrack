from datetime import datetime
from typing import Optional

from pydantic import Field

from app.db.models.cita import EstadoCitaEnum
from app.schemas.shared import ORMModel, TimestampedModel


class CitaBase(ORMModel):
    cliente_id: int
    vehiculo_id: Optional[int] = None
    fecha_inicio: datetime
    fecha_fin: datetime
    nota: Optional[str] = Field(default=None, max_length=255)
    estado: EstadoCitaEnum = EstadoCitaEnum.PROGRAMADA


class CitaCreate(CitaBase):
    pass


class CitaUpdate(ORMModel):
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    nota: Optional[str] = None
    estado: Optional[EstadoCitaEnum] = None


class CitaOut(CitaBase, TimestampedModel):
    id: int
