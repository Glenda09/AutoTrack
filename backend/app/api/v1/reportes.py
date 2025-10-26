from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.api import deps
from app.core.deps import get_db
from app.services import reporting

router = APIRouter()


def _csv_response(filename: str, content: str) -> Response:
    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/ventas-mensuales.csv")
def ventas_mensuales(
    *, db: Session = Depends(get_db), current_user=Depends(deps.role_required(["Admin", "Facturacion"]))
) -> Response:
    return _csv_response("ventas-mensuales.csv", reporting.ventas_mensuales(db))


@router.get("/movimientos-inventario.csv")
def movimientos_inventario(
    *, db: Session = Depends(get_db), current_user=Depends(deps.role_required(["Admin", "Inventario"]))
) -> Response:
    return _csv_response("movimientos-inventario.csv", reporting.movimientos_inventario(db))


@router.get("/rendimiento-tecnicos.csv")
def rendimiento_tecnicos(
    *, db: Session = Depends(get_db), current_user=Depends(deps.role_required(["Admin", "Supervisor"]))
) -> Response:
    return _csv_response("rendimiento-tecnicos.csv", reporting.rendimiento_tecnicos(db))


@router.get("/estado-cartera.csv")
def estado_cartera(
    *, db: Session = Depends(get_db), current_user=Depends(deps.role_required(["Admin", "Facturacion"]))
) -> Response:
    return _csv_response("estado-cartera.csv", reporting.estado_cartera(db))
