from __future__ import annotations

from datetime import datetime, timedelta
from decimal import Decimal

from faker import Faker
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.db.models.cita import Cita, EstadoCitaEnum
from app.db.models.cliente import Cliente, TipoClienteEnum
from app.db.models.detalle_orden import DetalleOrden, TipoItemEnum
from app.db.models.factura import EstadoPagoEnum, Factura
from app.db.models.historial_precio import HistorialPrecio
from app.db.models.orden_trabajo import EstadoOrdenEnum, OrdenTrabajo
from app.db.models.producto import Producto
from app.db.models.rol import Rol
from app.db.models.usuario import Usuario
from app.db.models.vehiculo import Vehiculo
from app.db.session import SessionLocal

fake = Faker("es_ES")


def seed_roles(db: Session) -> dict[str, Rol]:
    roles = {
        "Admin": "Acceso total",
        "Supervisor": "Gestiona operaciones",
        "Mecanico": "Gestiona órdenes asignadas",
        "Facturacion": "Gestiona facturas y reportes",
        "Inventario": "Gestiona inventario",
    }
    existing_roles = {rol.name: rol for rol in db.query(Rol).all()}
    result: dict[str, Rol] = {}
    for name, description in roles.items():
        if name in existing_roles:
            result[name] = existing_roles[name]
            continue
        rol = Rol(name=name, description=description)
        db.add(rol)
        db.commit()
        db.refresh(rol)
        result[name] = rol
    return result


def seed_users(db: Session, roles: dict[str, Rol]) -> dict[str, Usuario]:
    users_data = [
        ("admin", "Administrador", "admin@example.com", roles["Admin"], "admin123"),
        ("supervisor", "Supervisor General", "supervisor@example.com", roles["Supervisor"], "supervisor123"),
        ("mecanico", "Mecánico Demo", "mecanico@example.com", roles["Mecanico"], "mecanico123"),
        ("facturacion", "Facturación Demo", "facturacion@example.com", roles["Facturacion"], "facturacion123"),
        ("inventario", "Inventario Demo", "inventario@example.com", roles["Inventario"], "inventario123"),
    ]
    existing = {user.username: user for user in db.query(Usuario).all()}
    result: dict[str, Usuario] = {}
    for username, nombre, email, rol, password in users_data:
        if username in existing:
            result[username] = existing[username]
            continue
        usuario = Usuario(
            username=username,
            nombre_completo=nombre,
            email=email,
            rol_id=rol.id,
            hashed_password=get_password_hash(password),
            is_active=True,
        )
        db.add(usuario)
        db.commit()
        db.refresh(usuario)
        result[username] = usuario
    return result


def seed_clientes(db: Session) -> list[Cliente]:
    clientes = []
    if db.query(Cliente).count() >= 10:
        return db.query(Cliente).limit(10).all()
    for _ in range(10):
        cliente = Cliente(
            nombre=fake.name(),
            direccion=fake.address(),
            tipo_cliente=TipoClienteEnum.NATURAL,
            telefono=fake.phone_number(),
            email=fake.email(),
            nit=fake.ssn(),
        )
        db.add(cliente)
        db.commit()
        db.refresh(cliente)
        clientes.append(cliente)
    return clientes


def seed_vehiculos(db: Session, clientes: list[Cliente]) -> list[Vehiculo]:
    vehiculos = []
    if db.query(Vehiculo).count() >= 10:
        return db.query(Vehiculo).limit(10).all()
    for cliente in clientes:
        vehiculo = Vehiculo(
            placa=fake.unique.license_plate(),
            marca=fake.company(),
            modelo=fake.word().title(),
            anio=int(fake.year()),
            color=fake.color_name(),
            cliente_id=cliente.id,
        )
        db.add(vehiculo)
        db.commit()
        db.refresh(vehiculo)
        vehiculos.append(vehiculo)
    return vehiculos


def seed_productos(db: Session) -> list[Producto]:
    productos = []
    if db.query(Producto).count() >= 15:
        return db.query(Producto).limit(15).all()
    for idx in range(1, 16):
        producto = Producto(
            sku=f"SKU-{idx:03d}",
            nombre=f"Producto {idx}",
            descripcion=fake.sentence(),
            stock_actual=Decimal("50"),
            stock_reservado=Decimal("0"),
            stock_minimo=Decimal("10"),
            ubicacion=f"A{idx}",
            proveedor_principal=fake.company(),
        )
        db.add(producto)
        db.commit()
        db.refresh(producto)
        historial = HistorialPrecio(
            producto_id=producto.id,
            fecha_inicio=datetime.utcnow() - timedelta(days=30),
            precio_unitario=Decimal("25.00") + Decimal(str(idx)),
            costo_unitario=Decimal("15.00") + Decimal(str(idx)),
        )
        db.add(historial)
        db.commit()
        productos.append(producto)
    return productos


def seed_ordenes(
    db: Session,
    *,
    vehiculos: list[Vehiculo],
    usuarios: dict[str, Usuario],
    productos: list[Producto],
) -> list[OrdenTrabajo]:
    if db.query(OrdenTrabajo).count() >= 5:
        return db.query(OrdenTrabajo).limit(5).all()
    ordenes = []
    for idx in range(5):
        vehiculo = vehiculos[idx % len(vehiculos)]
        orden = OrdenTrabajo(
            vehiculo_id=vehiculo.id,
            usuario_responsable_id=usuarios["mecanico"].id,
            descripcion=f"Tarea de mantenimiento #{idx+1}",
            estado=EstadoOrdenEnum.PENDIENTE,
            fecha_entrega=datetime.utcnow() + timedelta(days=idx + 1),
            total_estimado=Decimal("0"),
        )
        db.add(orden)
        db.commit()
        db.refresh(orden)
        subtotal_total = Decimal("0")
        for detalle_idx in range(2):
            producto = productos[(idx * 2 + detalle_idx) % len(productos)]
            cantidad = Decimal("2")
            precio = Decimal("30.00") + Decimal(str(detalle_idx))
            detalle = DetalleOrden(
                orden_id=orden.id,
                tipo_item=TipoItemEnum.REPUESTO,
                producto_id=producto.id,
                descripcion="Cambio de repuesto",
                cantidad=cantidad,
                precio_unitario=precio,
                subtotal=cantidad * precio,
            )
            subtotal_total += detalle.subtotal
            db.add(detalle)
        mano_obra = DetalleOrden(
            orden_id=orden.id,
            tipo_item=TipoItemEnum.MANO_OBRA,
            descripcion="Mano de obra",
            cantidad=Decimal("1"),
            precio_unitario=Decimal("40.00"),
            subtotal=Decimal("40.00"),
        )
        subtotal_total += mano_obra.subtotal
        db.add(mano_obra)
        orden.total_estimado = subtotal_total
        if idx < 3:
            orden.estado = EstadoOrdenEnum.EN_PROCESO
            orden.confirmada = True
            orden.lista_para_facturar = idx % 2 == 0
        db.add(orden)
        db.commit()
        db.refresh(orden)
        ordenes.append(orden)
    return ordenes


def seed_facturas(db: Session, ordenes: list[OrdenTrabajo]) -> None:
    existentes = db.query(Factura).count()
    if existentes >= 2:
        return
    for orden in ordenes[:2]:
        factura = Factura(
            orden_id=orden.id,
            monto_total=orden.total_estimado + Decimal("15.00"),
            impuesto_aplicado=Decimal("15.00"),
            metodos_pago=["Efectivo"],
            metodo_pago="Efectivo",
            estado_pago=EstadoPagoEnum.PAGADA,
        )
        orden.estado = EstadoOrdenEnum.ENTREGADA
        orden.lista_para_facturar = False
        orden.confirmada = True
        db.add(factura)
        db.add(orden)
    db.commit()


def seed_citas(db: Session, clientes: list[Cliente], vehiculos: list[Vehiculo]) -> None:
    if db.query(Cita).count() >= 5:
        return
    base = datetime.utcnow().replace(hour=9, minute=0, second=0, microsecond=0)
    for idx in range(5):
        cita = Cita(
            cliente_id=clientes[idx % len(clientes)].id,
            vehiculo_id=vehiculos[idx % len(vehiculos)].id,
            fecha_inicio=base + timedelta(days=idx),
            fecha_fin=base + timedelta(days=idx, hours=1),
            nota=f"Cita programada #{idx + 1}",
            estado=EstadoCitaEnum.PROGRAMADA,
        )
        db.add(cita)
    db.commit()


def main() -> None:
    db = SessionLocal()
    try:
        roles = seed_roles(db)
        usuarios = seed_users(db, roles)
        clientes = seed_clientes(db)
        vehiculos = seed_vehiculos(db, clientes)
        productos = seed_productos(db)
        ordenes = seed_ordenes(db, vehiculos=vehiculos, usuarios=usuarios, productos=productos)
        seed_facturas(db, ordenes)
        seed_citas(db, clientes, vehiculos)
        print("Datos de ejemplo generados correctamente.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
