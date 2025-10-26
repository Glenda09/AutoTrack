from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import Field

from app.db.models.factura import EstadoPagoEnum
from app.schemas.shared import ORMModel, TimestampedModel


class FacturaBase(ORMModel):
    orden_id: int
    impuesto_aplicado: Decimal = Field(default=0, ge=0)
    metodos_pago: List[str] = Field(default_factory=list)
    metodo_pago: str = Field(min_length=2, max_length=100)
    estado_pago: EstadoPagoEnum = EstadoPagoEnum.PENDIENTE


class FacturaCreate(FacturaBase):
    monto_total: Decimal = Field(gt=0)


class FacturaUpdate(ORMModel):
    monto_total: Optional[Decimal] = None
    impuesto_aplicado: Optional[Decimal] = None
    estado_pago: Optional[EstadoPagoEnum] = None
    metodos_pago: Optional[List[str]] = None
    metodo_pago: Optional[str] = None


class FacturaOut(FacturaBase, TimestampedModel):
    id: int
    fecha_factura: datetime
    monto_total: Decimal
