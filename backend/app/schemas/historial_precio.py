from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import Field

from app.schemas.shared import ORMModel


class HistorialPrecioBase(ORMModel):
    fecha_inicio: datetime
    fecha_fin: Optional[datetime] = None
    precio_unitario: Decimal = Field(gt=0)
    costo_unitario: Decimal = Field(ge=0)


class HistorialPrecioCreate(HistorialPrecioBase):
    pass


class HistorialPrecioOut(HistorialPrecioBase):
    id: int
    producto_id: int
