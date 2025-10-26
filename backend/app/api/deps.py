from collections.abc import Callable, Sequence
from typing import Any

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.core.security import decode_token, oauth2_scheme
from app.db.models.usuario import Usuario


def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> Usuario:
    payload = decode_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    usuario = db.get(Usuario, int(user_id))
    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return usuario


def get_current_active_user(current_user: Usuario = Depends(get_current_user)) -> Usuario:
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
    return current_user


def role_required(roles: Sequence[str]) -> Callable[[Usuario], Usuario]:
    def checker(current_user: Usuario = Depends(get_current_active_user)) -> Usuario:
        if current_user.rol and current_user.rol.name in roles:
            return current_user
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    return checker
