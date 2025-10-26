from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import Field

from app.db.models.detalle_orden import TipoItemEnum
from app.db.models.orden_trabajo import EstadoOrdenEnum
from app.schemas.shared import ORMModel, TimestampedModel


class DetalleOrdenBase(ORMModel):
    tipo_item: TipoItemEnum
    producto_id: Optional[int] = None
    descripcion: Optional[str] = Field(default=None, max_length=255)
    cantidad: Decimal = Field(gt=0)
    precio_unitario: Optional[Decimal] = Field(default=None, ge=0)


class DetalleOrdenCreate(DetalleOrdenBase):
    pass


class DetalleOrdenUpdate(ORMModel):
    tipo_item: Optional[TipoItemEnum] = None
    producto_id: Optional[int] = None
    descripcion: Optional[str] = None
    cantidad: Optional[Decimal] = None
    precio_unitario: Optional[Decimal] = None


class DetalleOrdenOut(DetalleOrdenBase):
    id: int
    subtotal: Decimal


class OrdenTrabajoBase(ORMModel):
    vehiculo_id: int
    usuario_responsable_id: Optional[int] = None
    descripcion: Optional[str] = None
    estado: EstadoOrdenEnum = EstadoOrdenEnum.PENDIENTE
    fecha_entrega: Optional[datetime] = None
    total_estimado: Decimal = Field(default=0, ge=0)


class OrdenTrabajoCreate(OrdenTrabajoBase):
    detalles: List[DetalleOrdenCreate] = []


class OrdenTrabajoUpdate(ORMModel):
    usuario_responsable_id: Optional[int] = None
    descripcion: Optional[str] = None
    estado: Optional[EstadoOrdenEnum] = None
    fecha_entrega: Optional[datetime] = None
    lista_para_facturar: Optional[bool] = None
    total_estimado: Optional[Decimal] = None


class OrdenTrabajoOut(OrdenTrabajoBase, TimestampedModel):
    id: int
    lista_para_facturar: bool
    confirmada: bool
    detalles: List[DetalleOrdenOut] = []
