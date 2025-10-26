from decimal import Decimal
from typing import Optional

from pydantic import Field

from app.schemas.shared import ORMModel, TimestampedModel


class ProductoBase(ORMModel):
    sku: str = Field(min_length=2, max_length=50)
    nombre: str = Field(min_length=3, max_length=150)
    descripcion: Optional[str] = Field(default=None, max_length=255)
    stock_actual: Decimal = Field(default=0, ge=0)
    stock_minimo: Decimal = Field(default=0, ge=0)
    ubicacion: Optional[str] = Field(default=None, max_length=100)
    proveedor_principal: Optional[str] = Field(default=None, max_length=150)


class ProductoCreate(ProductoBase):
    stock_reservado: Decimal = Field(default=0, ge=0)


class ProductoUpdate(ORMModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    stock_actual: Optional[Decimal] = None
    stock_reservado: Optional[Decimal] = None
    stock_minimo: Optional[Decimal] = None
    ubicacion: Optional[str] = None
    proveedor_principal: Optional[str] = None
    is_active: Optional[bool] = None


class ProductoOut(ProductoBase, TimestampedModel):
    id: int
    stock_reservado: Decimal
    is_active: bool
