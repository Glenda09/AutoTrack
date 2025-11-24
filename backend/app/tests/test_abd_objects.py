from __future__ import annotations

from datetime import datetime
import os
import uuid
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine

from app.core.config import settings
from app.main import app
from app.seeds import seed_abd_minimos

USE_MYSQL = os.getenv("USE_MYSQL_TEST_DB") == "1"


def _build_engine() -> Engine | None:
    if not USE_MYSQL:
        return None
    try:
        engine = create_engine(settings.sqlalchemy_database_uri, future=True)
        if engine.url.get_backend_name() != "mysql":
            return None
        with engine.connect() as conn:
            conn.exec_driver_sql("SELECT 1")
        return engine
    except Exception:
        return None


ENGINE = _build_engine()

if ENGINE is None:
    pytest.skip("MySQL requerido para pruebas ABD (USE_MYSQL_TEST_DB=1).", allow_module_level=True)


@pytest.fixture(scope="session")
def mysql_engine() -> Engine:
    return ENGINE


@pytest.fixture(scope="session", autouse=True)
def seed_abd(mysql_engine: Engine) -> None:
    seed_abd_minimos.seed()


def _get_ids(conn) -> dict[str, int]:
    producto_id = conn.exec_driver_sql("SELECT id FROM productos WHERE sku = 'SKU-ABD-01'").scalar()
    vehiculo_id = conn.exec_driver_sql("SELECT id FROM vehiculos LIMIT 1").scalar()
    usuario_id = conn.exec_driver_sql("SELECT id FROM usuarios ORDER BY id LIMIT 1").scalar()
    if not all((producto_id, vehiculo_id, usuario_id)):
        raise AssertionError("Datos ABD no disponibles para pruebas MySQL")
    return {"producto_id": int(producto_id), "vehiculo_id": int(vehiculo_id), "usuario_id": int(usuario_id)}


def test_fn_precio_vigente(mysql_engine: Engine) -> None:
    with mysql_engine.connect() as conn:
        ids = _get_ids(conn)
        value = conn.exec_driver_sql(
            "SELECT fn_precio_vigente(%(pid)s, CURDATE())", {"pid": ids["producto_id"]}
        ).scalar()
        assert value is not None
        assert float(value) > 0


def test_trg_detalle_orden_bi_subtotal(mysql_engine: Engine) -> None:
    with mysql_engine.begin() as conn:
        ids = _get_ids(conn)
        descripcion = f"Detalle trigger {uuid.uuid4()}"
        conn.exec_driver_sql(
            """
            INSERT INTO ordenes_trabajo
            (vehiculo_id, usuario_responsable_id, fecha_creacion, descripcion, estado, fecha_entrega, total_estimado, lista_para_facturar, confirmada, created_at, updated_at)
            VALUES (%(vehiculo_id)s, %(usuario_id)s, NOW(), %(descripcion)s, 'Pendiente', NOW(), 0, 0, 1, NOW(), NOW())
            """,
            {"vehiculo_id": ids["vehiculo_id"], "usuario_id": ids["usuario_id"], "descripcion": descripcion},
        )
        ot_id = conn.exec_driver_sql("SELECT LAST_INSERT_ID()").scalar()
        conn.exec_driver_sql(
            """
            INSERT INTO detalle_orden (orden_id, tipo_item, producto_id, descripcion, cantidad, precio_unitario, subtotal)
            VALUES (%(orden_id)s, 'Repuesto', %(producto_id)s, %(desc)s, 2, NULL, 0)
            """,
            {"orden_id": ot_id, "producto_id": ids["producto_id"], "desc": descripcion},
        )
        row = conn.exec_driver_sql(
            """
            SELECT precio_unitario, subtotal
            FROM detalle_orden
            WHERE orden_id = %(ot_id)s AND descripcion = %(desc)s
            ORDER BY id DESC LIMIT 1
            """,
            {"ot_id": ot_id, "desc": descripcion},
        ).first()
        expected_price = conn.exec_driver_sql(
            "SELECT fn_precio_vigente(%(pid)s, CURDATE())", {"pid": ids["producto_id"]}
        ).scalar()
        assert float(row[0]) == pytest.approx(float(expected_price))
        assert float(row[1]) == pytest.approx(float(expected_price) * 2)


def test_sp_facturar_y_revertir(mysql_engine: Engine) -> None:
    with mysql_engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
        ids = _get_ids(conn)
        descripcion = f"OT facturable {uuid.uuid4()}"
        stock_before = conn.exec_driver_sql(
            "SELECT stock_actual FROM productos WHERE id = %(pid)s", {"pid": ids["producto_id"]}
        ).scalar()
        conn.exec_driver_sql(
            """
            INSERT INTO ordenes_trabajo
            (vehiculo_id, usuario_responsable_id, fecha_creacion, descripcion, estado, fecha_entrega, total_estimado, lista_para_facturar, confirmada, created_at, updated_at)
            VALUES (%(vehiculo_id)s, %(usuario_id)s, NOW(), %(descripcion)s, 'Completada', NOW(), 0, 1, 1, NOW(), NOW())
            """,
            {"vehiculo_id": ids["vehiculo_id"], "usuario_id": ids["usuario_id"], "descripcion": descripcion},
        )
        ot_id = conn.exec_driver_sql("SELECT LAST_INSERT_ID()").scalar()
        conn.exec_driver_sql(
            """
            INSERT INTO detalle_orden (orden_id, tipo_item, producto_id, descripcion, cantidad, precio_unitario, subtotal)
            VALUES (%(orden_id)s, 'Repuesto', %(producto_id)s, 'Linea prueba SP', 1, 50, 50)
            """,
            {"orden_id": ot_id, "producto_id": ids["producto_id"]},
        )
        conn.exec_driver_sql("CALL sp_facturar_orden(%(ot_id)s, %(imp)s, %(metodo)s)", {"ot_id": ot_id, "imp": Decimal("5.00"), "metodo": "Efectivo"})
        factura_id = conn.exec_driver_sql(
            "SELECT id FROM facturas WHERE orden_id = %(ot_id)s", {"ot_id": ot_id}
        ).scalar()
        stock_after = conn.exec_driver_sql(
            "SELECT stock_actual FROM productos WHERE id = %(pid)s", {"pid": ids["producto_id"]}
        ).scalar()
        assert factura_id is not None
        assert float(stock_after) == pytest.approx(float(stock_before) - 1)

        conn.exec_driver_sql("CALL sp_revertir_factura(%(fid)s)", {"fid": factura_id})
        stock_restored = conn.exec_driver_sql(
            "SELECT stock_actual FROM productos WHERE id = %(pid)s", {"pid": ids["producto_id"]}
        ).scalar()
        factura_count = conn.exec_driver_sql(
            "SELECT COUNT(*) FROM facturas WHERE id = %(fid)s", {"fid": factura_id}
        ).scalar()
        estado_ot = conn.exec_driver_sql(
            "SELECT estado FROM ordenes_trabajo WHERE id = %(ot_id)s", {"ot_id": ot_id}
        ).scalar()
        assert float(stock_restored) == pytest.approx(float(stock_before))
        assert factura_count == 0
        assert estado_ot == "Completada"


def test_reportes_endpoints(mysql_engine: Engine) -> None:
    client = TestClient(app)
    login = client.post("/api/v1/auth/login", json={"username": "admin", "password": "admin123"})
    assert login.status_code == 200
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    today = datetime.utcnow()
    kpi_resp = client.get(
        "/api/v1/reportes/kpi-mensual",
        params={"anio": today.year, "mes": today.month},
        headers=headers,
    )
    assert kpi_resp.status_code == 200
    kpi_data = kpi_resp.json()
    assert "total_facturado" in kpi_data
    assert "ingresos_funcion" in kpi_data

    stock_resp = client.get("/api/v1/reportes/stock-bajo", headers=headers)
    assert stock_resp.status_code == 200
    assert isinstance(stock_resp.json(), list)

    ot_resp = client.get("/api/v1/reportes/ordenes-detalladas", headers=headers)
    assert ot_resp.status_code == 200
    assert isinstance(ot_resp.json(), list)
