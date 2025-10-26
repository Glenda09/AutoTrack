from fastapi import status


def _auth_headers(client):
    token = client.post("/api/v1/auth/login", json={"username": "admin", "password": "admin123"}).json()[
        "access_token"
    ]
    return {"Authorization": f"Bearer {token}"}


def test_list_clientes(client):
    headers = _auth_headers(client)
    response = client.get("/api/v1/clientes", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "total" in data
    assert data["total"] >= 1


def test_create_cliente(client):
    headers = _auth_headers(client)
    payload = {
        "nombre": "Cliente Pytest",
        "direccion": "Calle Pytest 123",
        "tipo_cliente": "Natural",
        "telefono": "555-3333",
        "email": "pytest@example.com",
        "nit": "NIT-999",
    }
    response = client.post("/api/v1/clientes", json=payload, headers=headers)
    assert response.status_code == status.HTTP_201_CREATED
    created = response.json()
    assert created["nombre"] == payload["nombre"]
    search = client.get("/api/v1/clientes?search=Pytest", headers=headers)
    assert search.status_code == status.HTTP_200_OK
    assert search.json()["total"] >= 1
