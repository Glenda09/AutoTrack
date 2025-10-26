from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.deps import get_db
from app.core.security import get_password_hash
from app.db import base
from app.db.models.cliente import Cliente, TipoClienteEnum
from app.db.models.rol import Rol
from app.db.models.usuario import Usuario
from app.db import session as session_module
from app.main import app

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"


@pytest.fixture(scope="session", autouse=True)
def override_settings() -> Generator[None, None, None]:
    test_engine = create_engine(
        SQLALCHEMY_TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    base.Base.metadata.create_all(bind=test_engine)
    session_module.engine = test_engine
    session_module.SessionLocal = TestingSessionLocal

    def _get_db() -> Generator[Session, None, None]:
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = _get_db
    yield
    base.Base.metadata.drop_all(bind=test_engine)


@pytest.fixture()
def db_session() -> Generator[Session, None, None]:
    db = session_module.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture()
def client(db_session: Session) -> TestClient:
    _seed_core(db_session)
    return TestClient(app)


def _seed_core(db: Session) -> None:
    if db.query(Rol).count() == 0:
        roles = [
            Rol(name="Admin", description="Admin"),
            Rol(name="Supervisor", description="Supervisor"),
            Rol(name="Mecanico", description="Mecanico"),
            Rol(name="Facturacion", description="Facturacion"),
            Rol(name="Inventario", description="Inventario"),
        ]
        db.add_all(roles)
        db.commit()
    admin_role = db.query(Rol).filter(Rol.name == "Admin").first()
    if not db.query(Usuario).filter(Usuario.username == "admin").first():
        usuario = Usuario(
            username="admin",
            nombre_completo="Admin",
            email="admin@test.com",
            rol_id=admin_role.id,
            hashed_password=get_password_hash("admin123"),
        )
        db.add(usuario)
        db.commit()
    if db.query(Cliente).count() == 0:
        cliente = Cliente(
            nombre="Cliente Test",
            direccion="Calle 123",
            tipo_cliente=TipoClienteEnum.NATURAL,
            telefono="555-0000",
            email="cliente@test.com",
            nit="123456",
        )
        db.add(cliente)
        db.commit()
