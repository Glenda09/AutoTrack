from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.core.deps import get_db
from app.db.models.rol import Rol
from app.schemas.rol import RolOut

router = APIRouter()


@router.get("/", response_model=list[RolOut])
def list_roles(
    *,
    db: Session = Depends(get_db),
    current_user=Depends(deps.role_required(["Admin"])),
) -> list[RolOut]:
    roles = db.query(Rol).order_by(Rol.id.asc()).all()
    return [RolOut.model_validate(rol) for rol in roles]
