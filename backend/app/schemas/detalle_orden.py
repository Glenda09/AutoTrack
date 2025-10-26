from decimal import Decimal
from typing import Optional

from pydantic import Field

from app.db.models.detalle_orden import TipoItemEnum
from app.schemas.shared import ORMModel


class DetalleOrdenBase(ORMModel):
    tipo_item: TipoItemEnum
    producto_id: Optional[int] = None
    descripcion: Optional[str] = Field(default=None, max_length=255)
    cantidad: Decimal = Field(gt=0)
    precio_unitario: Optional[Decimal] = Field(default=None, ge=0)


class DetalleOrdenCreate(DetalleOrdenBase):
    pass


class DetalleOrdenOut(DetalleOrdenBase):
    id: int
    subtotal: Decimal
