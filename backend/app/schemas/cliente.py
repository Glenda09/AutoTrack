from typing import Optional

from pydantic import EmailStr, Field

from app.db.models.cliente import TipoClienteEnum
from app.schemas.shared import ORMModel, TimestampedModel


class ClienteBase(ORMModel):
    nombre: str = Field(min_length=3, max_length=150)
    direccion: Optional[str] = Field(default=None, max_length=255)
    tipo_cliente: TipoClienteEnum
    telefono: Optional[str] = Field(default=None, max_length=50)
    email: Optional[EmailStr] = None
    nit: Optional[str] = Field(default=None, max_length=50)


class ClienteCreate(ClienteBase):
    pass


class ClienteUpdate(ORMModel):
    nombre: Optional[str] = None
    direccion: Optional[str] = None
    tipo_cliente: Optional[TipoClienteEnum] = None
    telefono: Optional[str] = None
    email: Optional[EmailStr] = None
    nit: Optional[str] = None
    is_active: Optional[bool] = None


class ClienteOut(ClienteBase, TimestampedModel):
    id: int
    is_active: bool
