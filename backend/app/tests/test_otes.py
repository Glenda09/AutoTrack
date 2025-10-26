from datetime import datetime

from fastapi import status


def _auth_headers(client):
    token = client.post("/api/v1/auth/login", json={"username": "admin", "password": "admin123"}).json()[
        "access_token"
    ]
    return {"Authorization": f"Bearer {token}"}


def test_orden_trabajo_flow(client):
    headers = _auth_headers(client)

    producto_payload = {
        "sku": "TEST-SKU",
        "nombre": "Producto Test",
        "descripcion": "Repuesto para pruebas",
        "stock_actual": 10,
        "stock_minimo": 1,
        "stock_reservado": 0,
        "ubicacion": "A1",
        "proveedor_principal": "Proveedor Test",
    }
    producto_resp = client.post("/api/v1/productos", json=producto_payload, headers=headers)
    assert producto_resp.status_code == status.HTTP_201_CREATED
    producto_id = producto_resp.json()["id"]

    historial_payload = {
        "fecha_inicio": datetime.utcnow().isoformat(),
        "precio_unitario": "20.00",
        "costo_unitario": "12.00",
    }
    historial_resp = client.post(
        f"/api/v1/productos/{producto_id}/historial-precios",
        json=historial_payload,
        headers=headers,
    )
    assert historial_resp.status_code == status.HTTP_201_CREATED

    vehiculo_payload = {
        "placa": "TEST-123",
        "marca": "Marca Test",
        "modelo": "Modelo Test",
        "anio": 2020,
        "color": "Azul",
        "cliente_id": 1,
    }
    vehiculo_resp = client.post("/api/v1/vehiculos", json=vehiculo_payload, headers=headers)
    assert vehiculo_resp.status_code == status.HTTP_201_CREATED
    vehiculo_id = vehiculo_resp.json()["id"]

    orden_payload = {
        "vehiculo_id": vehiculo_id,
        "usuario_responsable_id": None,
        "descripcion": "Diagnóstico",
        "estado": "Pendiente",
        "detalles": [
            {
                "tipo_item": "Repuesto",
                "producto_id": producto_id,
                "cantidad": 1,
            }
        ],
    }
    orden_resp = client.post("/api/v1/otes", json=orden_payload, headers=headers)
    assert orden_resp.status_code == status.HTTP_201_CREATED
    orden_id = orden_resp.json()["id"]

    confirmar = client.post(f"/api/v1/otes/{orden_id}/confirmar", headers=headers)
    assert confirmar.status_code == status.HTTP_200_OK
    assert confirmar.json()["confirmada"] is True
