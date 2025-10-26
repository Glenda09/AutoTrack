from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.core.deps import get_db
from app.core.security import get_password_hash
from app.db.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioOut, UsuarioUpdate
from app.services.auditing import log_action

router = APIRouter()


@router.get("/", response_model=list[UsuarioOut])
def list_usuarios(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.role_required(["Admin"])),
) -> list[UsuarioOut]:
    usuarios = db.query(Usuario).all()
    return [UsuarioOut.model_validate(u) for u in usuarios]


@router.post("/", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
def create_usuario(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.role_required(["Admin"])),
    data: UsuarioCreate,
) -> UsuarioOut:
    if db.query(Usuario).filter(Usuario.username == data.username).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Usuario ya existe")
    usuario = Usuario(
        username=data.username,
        nombre_completo=data.nombre_completo,
        email=data.email,
        rol_id=data.rol_id,
        is_active=data.is_active,
        hashed_password=get_password_hash(data.password),
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    log_action(
        db,
        usuario=current_user,
        entidad="usuarios",
        entidad_id=usuario.id,
        accion="CREAR",
        payload=data.model_dump(exclude={"password"}),
    )
    return UsuarioOut.model_validate(usuario)


@router.get("/{usuario_id}", response_model=UsuarioOut)
def get_usuario(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.role_required(["Admin"])),
    usuario_id: int,
) -> UsuarioOut:
    usuario = db.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    return UsuarioOut.model_validate(usuario)


@router.patch("/{usuario_id}", response_model=UsuarioOut)
def update_usuario(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.role_required(["Admin"])),
    usuario_id: int,
    data: UsuarioUpdate,
) -> UsuarioOut:
    usuario = db.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    payload = data.model_dump(exclude_unset=True)
    if "password" in payload and payload["password"]:
        usuario.hashed_password = get_password_hash(payload.pop("password"))
    for field, value in payload.items():
        setattr(usuario, field, value)
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    log_action(
        db,
        usuario=current_user,
        entidad="usuarios",
        entidad_id=usuario.id,
        accion="ACTUALIZAR",
        payload=payload,
    )
    return UsuarioOut.model_validate(usuario)


@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_usuario(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.role_required(["Admin"])),
    usuario_id: int,
) -> None:
    usuario = db.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    db.delete(usuario)
    db.commit()
    log_action(
        db,
        usuario=current_user,
        entidad="usuarios",
        entidad_id=usuario.id,
        accion="ELIMINAR",
        payload={"usuario_id": usuario_id},
    )
