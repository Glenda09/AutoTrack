from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.usuario import UsuarioOut


class LoginRequest(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    role: str
    user: UsuarioOut


class TokenPayload(BaseModel):
    sub: str
    role: str
    exp: datetime


class RefreshTokenRequest(BaseModel):
    refresh_token: Optional[str] = Field(default=None, description="Reservado para futuros despliegues")
