from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.core.config import settings
from app.core.deps import get_db
from app.core.security import create_access_token, verify_password
from app.db.models.usuario import Usuario
from app.schemas.auth import LoginRequest, Token
from app.schemas.usuario import UsuarioOut

router = APIRouter()


@router.post("/login", response_model=Token)
def login(form_data: LoginRequest, db: Session = Depends(get_db)) -> Token:
    usuario = (
        db.query(Usuario)
        .filter(Usuario.username == form_data.username)
        .first()
    )
    if not usuario or not verify_password(form_data.password, usuario.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales invalidas")
    if not usuario.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Usuario inactivo")
    access_token = create_access_token(
        subject=str(usuario.id),
        role=usuario.rol.name if usuario.rol else "",
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return Token(
        access_token=access_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        role=usuario.rol.name if usuario.rol else "",
        user=UsuarioOut.model_validate(usuario),
    )


@router.get("/me", response_model=UsuarioOut)
def read_users_me(current_user: Usuario = Depends(get_current_active_user)) -> UsuarioOut:
    return UsuarioOut.model_validate(current_user)

