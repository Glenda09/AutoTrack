from typing import Optional

from pydantic import EmailStr, Field

from app.schemas.shared import ORMModel, TimestampedModel


class UsuarioBase(ORMModel):
    username: str = Field(min_length=3, max_length=50)
    nombre_completo: str = Field(min_length=3, max_length=150)
    email: Optional[EmailStr] = None
    rol_id: int
    is_active: bool = True


class UsuarioCreate(UsuarioBase):
    password: str = Field(min_length=6)


class UsuarioUpdate(ORMModel):
    nombre_completo: Optional[str] = None
    email: Optional[EmailStr] = None
    rol_id: Optional[int] = None
    password: Optional[str] = Field(default=None, min_length=6)
    is_active: Optional[bool] = None


class UsuarioOut(UsuarioBase, TimestampedModel):
    id: int
