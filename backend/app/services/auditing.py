from typing import Any
import logging

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.db.models.audit_log import AuditLog
from app.db.models.usuario import Usuario

_logger = logging.getLogger(__name__)


def log_action(
    db: Session,
    *,
    usuario: Usuario | None,
    entidad: str,
    entidad_id: int | None,
    accion: str,
    payload: dict[str, Any] | None = None,
) -> None:
    """Persist an audit log entry.

    This function is intentionally resilient: failures to write audit logs will be
    caught and logged, and will not propagate to API handlers (to avoid turning
    otherwise-successful operations into 500 errors).
    """
    registro = AuditLog(
        usuario_id=usuario.id if usuario else None,
        entidad=entidad,
        entidad_id=entidad_id,
        accion=accion,
        payload=payload or {},
    )
    try:
        db.add(registro)
        db.commit()
    except SQLAlchemyError as exc:
        # Rollback the session to leave it in a usable state for the caller.
        try:
            db.rollback()
        except Exception:
            # ignore rollback failure, but log it
            _logger.exception("Failed to rollback DB session after audit log error")
        # Log the original exception for troubleshooting but do not re-raise.
        _logger.exception("Failed to write audit log: %s", exc)
