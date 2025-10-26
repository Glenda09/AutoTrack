from typing import Optional

from pydantic import Field

from app.schemas.shared import ORMModel, TimestampedModel


class VehiculoBase(ORMModel):
    placa: str = Field(min_length=3, max_length=15)
    marca: str = Field(min_length=2, max_length=100)
    modelo: str = Field(min_length=1, max_length=100)
    anio: int = Field(ge=1950, le=2100)
    color: Optional[str] = Field(default=None, max_length=50)
    cliente_id: int


class VehiculoCreate(VehiculoBase):
    pass


class VehiculoUpdate(ORMModel):
    marca: Optional[str] = None
    modelo: Optional[str] = None
    anio: Optional[int] = None
    color: Optional[str] = None


class VehiculoOut(VehiculoBase, TimestampedModel):
    id: int
