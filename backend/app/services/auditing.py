from typing import Any

from sqlalchemy.orm import Session

from app.db.models.audit_log import AuditLog
from app.db.models.usuario import Usuario


def log_action(
    db: Session,
    *,
    usuario: Usuario | None,
    entidad: str,
    entidad_id: int | None,
    accion: str,
    payload: dict[str, Any] | None = None,
) -> None:
    registro = AuditLog(
        usuario_id=usuario.id if usuario else None,
        entidad=entidad,
        entidad_id=entidad_id,
        accion=accion,
        payload=payload or {},
    )
    db.add(registro)
    db.commit()
