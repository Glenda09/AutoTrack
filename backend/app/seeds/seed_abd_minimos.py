from __future__ import annotations

from datetime import datetime, timedelta
from decimal import Decimal

from app.core.security import get_password_hash
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


def _get_or_create_role(db, name: str, description: str) -> Rol:
    rol = db.query(Rol).filter(Rol.name == name).first()
    if rol:
        return rol
    rol = Rol(name=name, description=description, created_at=datetime.utcnow(), updated_at=datetime.utcnow())
    db.add(rol)
    db.commit()
    db.refresh(rol)
    return rol


def _get_or_create_user(db, username: str, email: str, rol_id: int, full_name: str, password: str) -> Usuario:
    user = db.query(Usuario).filter(Usuario.username == username).first()
    if user:
        return user
    user = Usuario(
        username=username,
        nombre_completo=full_name,
        email=email,
        rol_id=rol_id,
        hashed_password=get_password_hash(password),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _get_or_create_cliente(db, nombre: str, nit: str, telefono: str) -> Cliente:
    cliente = db.query(Cliente).filter(Cliente.nit == nit).first()
    if cliente:
        return cliente
    cliente = Cliente(
        nombre=nombre,
        direccion="ABD",
        tipo_cliente=TipoClienteEnum.NATURAL,
        telefono=telefono,
        email=f"{nit.lower()}@abd.test",
        nit=nit,
    )
    db.add(cliente)
    db.commit()
    db.refresh(cliente)
    return cliente


def _get_or_create_vehiculo(db, placa: str, cliente_id: int, marca: str, modelo: str, anio: int, color: str) -> Vehiculo:
    vehiculo = db.query(Vehiculo).filter(Vehiculo.placa == placa).first()
    if vehiculo:
        return vehiculo
    vehiculo = Vehiculo(
        placa=placa,
        marca=marca,
        modelo=modelo,
        anio=anio,
        color=color,
        cliente_id=cliente_id,
    )
    db.add(vehiculo)
    db.commit()
    db.refresh(vehiculo)
    return vehiculo


def _get_or_create_producto(
    db,
    sku: str,
    nombre: str,
    descripcion: str,
    stock_actual: Decimal,
    stock_minimo: Decimal,
) -> Producto:
    producto = db.query(Producto).filter(Producto.sku == sku).first()
    now = datetime.utcnow()
    if producto:
        producto.stock_actual = stock_actual
        producto.stock_minimo = stock_minimo
        producto.updated_at = now
        db.add(producto)
        db.commit()
        db.refresh(producto)
        return producto
    producto = Producto(
        sku=sku,
        nombre=nombre,
        descripcion=descripcion,
        stock_actual=stock_actual,
        stock_reservado=Decimal("0"),
        stock_minimo=stock_minimo,
        ubicacion="ABD",
        proveedor_principal="Proveedor Demo",
    )
    db.add(producto)
    db.commit()
    db.refresh(producto)
    return producto


def _ensure_historial_precio(db, producto_id: int, precio: Decimal, costo: Decimal) -> None:
    open_range = (
        db.query(HistorialPrecio)
        .filter(HistorialPrecio.producto_id == producto_id, HistorialPrecio.fecha_fin.is_(None))
        .first()
    )
    if open_range:
        return
    db.add(
        HistorialPrecio(
            producto_id=producto_id,
            fecha_inicio=datetime.utcnow() - timedelta(days=10),
            fecha_fin=None,
            precio_unitario=precio,
            costo_unitario=costo,
        )
    )
    db.commit()


def _create_ot_si_no_existe(
    db, descripcion: str, vehiculo_id: int, usuario_id: int, estado: EstadoOrdenEnum, lista_para_facturar: bool
) -> OrdenTrabajo:
    ot = db.query(OrdenTrabajo).filter(OrdenTrabajo.descripcion == descripcion).first()
    if ot:
        return ot
    ot = OrdenTrabajo(
        vehiculo_id=vehiculo_id,
        usuario_responsable_id=usuario_id,
        descripcion=descripcion,
        estado=estado,
        fecha_creacion=datetime.utcnow() - timedelta(days=2),
        fecha_entrega=datetime.utcnow() + timedelta(days=2),
        total_estimado=Decimal("0"),
        lista_para_facturar=lista_para_facturar,
        confirmada=True,
    )
    db.add(ot)
    db.commit()
    db.refresh(ot)
    return ot


def _add_detalle_if_missing(
    db,
    orden_id: int,
    tipo_item: TipoItemEnum,
    descripcion: str,
    cantidad: Decimal,
    precio_unitario: Decimal,
    producto_id: int | None = None,
) -> DetalleOrden:
    detalle = (
        db.query(DetalleOrden)
        .filter(DetalleOrden.orden_id == orden_id, DetalleOrden.descripcion == descripcion)
        .first()
    )
    if detalle:
        return detalle
    detalle = DetalleOrden(
        orden_id=orden_id,
        tipo_item=tipo_item,
        producto_id=producto_id,
        descripcion=descripcion,
        cantidad=cantidad,
        precio_unitario=precio_unitario,
        subtotal=cantidad * precio_unitario,
    )
    db.add(detalle)
    db.commit()
    db.refresh(detalle)
    return detalle


def _ensure_factura(db, orden: OrdenTrabajo, impuesto: Decimal) -> None:
    if db.query(Factura).filter(Factura.orden_id == orden.id).first():
        return
    rows = (
        db.query(DetalleOrden.subtotal)
        .filter(DetalleOrden.orden_id == orden.id)
        .all()
    )
    monto = sum(Decimal(value) for (value,) in rows) if rows else Decimal("0")
    factura = Factura(
        orden_id=orden.id,
        monto_total=monto + impuesto,
        impuesto_aplicado=impuesto,
        metodo_pago="Efectivo",
        metodos_pago=["Efectivo"],
        estado_pago=EstadoPagoEnum.PAGADA,
    )
    orden.estado = EstadoOrdenEnum.ENTREGADA
    orden.lista_para_facturar = False
    db.add(factura)
    db.add(orden)
    db.commit()


def seed() -> None:
    db = SessionLocal()
    try:
        admin_role = _get_or_create_role(db, "Admin", "Acceso total")
        fact_role = _get_or_create_role(db, "Facturacion", "Gestiona facturacion")
        inv_role = _get_or_create_role(db, "Inventario", "Gestiona inventario")
        tecnico_role = _get_or_create_role(db, "Mecanico", "Mecanico/Asesor")
        contable_role = _get_or_create_role(db, "Contable", "Administrativo/Contable")
        cliente_role = _get_or_create_role(db, "Cliente", "Portal cliente")

        admin = _get_or_create_user(db, "admin", "admin+abd@example.com", admin_role.id, "Administrador ABD", "admin123")
        _get_or_create_user(db, "tecnico_demo", "tecnico@example.com", tecnico_role.id, "Tecnico Demo", "demo123")
        _get_or_create_user(db, "inventario_demo", "inventario@example.com", inv_role.id, "Inventario Demo", "demo123")
        _get_or_create_user(db, "contable_demo", "contable@example.com", contable_role.id, "Contable Demo", "demo123")
        _get_or_create_user(db, "cliente_portal", "cliente@example.com", cliente_role.id, "Cliente Portal", "cliente123")

        clientes = [
            _get_or_create_cliente(db, "Cliente ABD 1", "NIT-ABD-01", "555-1001"),
            _get_or_create_cliente(db, "Cliente ABD 2", "NIT-ABD-02", "555-1002"),
            _get_or_create_cliente(db, "Cliente ABD 3", "NIT-ABD-03", "555-1003"),
            _get_or_create_cliente(db, "Cliente ABD 4", "NIT-ABD-04", "555-1004"),
            _get_or_create_cliente(db, "Cliente ABD 5", "NIT-ABD-05", "555-1005"),
        ]
        vehiculos = [
            _get_or_create_vehiculo(db, "ABD-001", clientes[0].id, "Toyota", "Corolla", 2020, "Rojo"),
            _get_or_create_vehiculo(db, "ABD-002", clientes[1].id, "Nissan", "Sentra", 2019, "Azul"),
            _get_or_create_vehiculo(db, "ABD-003", clientes[2].id, "Mazda", "3", 2021, "Gris"),
        ]

        productos = [
            _get_or_create_producto(db, "SKU-ABD-01", "Filtro de aceite", "Filtro motor", Decimal("25"), Decimal("5")),
            _get_or_create_producto(db, "SKU-ABD-02", "Pastillas de freno", "Set frenos", Decimal("8"), Decimal("10")),
            _get_or_create_producto(db, "SKU-ABD-03", "Aceite 10W40", "Aceite sintetico", Decimal("50"), Decimal("15")),
            _get_or_create_producto(db, "SKU-ABD-04", "Bujia", "Bujia estandar", Decimal("12"), Decimal("10")),
            _get_or_create_producto(db, "SKU-ABD-05", "Filtro de aire", "Filtro cabina", Decimal("5"), Decimal("8")),
            _get_or_create_producto(db, "SKU-ABD-06", "Correa", "Correa de alternador", Decimal("7"), Decimal("6")),
            _get_or_create_producto(db, "SKU-ABD-07", "Amortiguador", "Amortiguador delantero", Decimal("4"), Decimal("3")),
            _get_or_create_producto(db, "SKU-ABD-08", "Liquido de frenos", "DOT 4", Decimal("18"), Decimal("10")),
        ]
        for prod in productos[:3]:
            _ensure_historial_precio(db, prod.id, Decimal("35.50"), Decimal("20.00"))

        ot1 = _create_ot_si_no_existe(
            db, "OT ABD - Cambio aceite", vehiculos[0].id, admin.id, EstadoOrdenEnum.EN_PROCESO, True
        )
        ot2 = _create_ot_si_no_existe(
            db, "OT ABD - Frenos", vehiculos[1].id, admin.id, EstadoOrdenEnum.PENDIENTE, False
        )
        ot3 = _create_ot_si_no_existe(
            db, "OT ABD - Lista para facturar", vehiculos[2].id, admin.id, EstadoOrdenEnum.COMPLETADA, True
        )

        _add_detalle_if_missing(
            db, ot1.id, TipoItemEnum.REPUESTO, "Filtro ABD", Decimal("1"), Decimal("35.50"), productos[0].id
        )
        _add_detalle_if_missing(
            db, ot1.id, TipoItemEnum.MANO_OBRA, "Mano de obra ABD", Decimal("1"), Decimal("40.00")
        )
        _add_detalle_if_missing(
            db, ot2.id, TipoItemEnum.REPUESTO, "Pastillas ABD", Decimal("2"), Decimal("55.00"), productos[1].id
        )
        _add_detalle_if_missing(
            db, ot2.id, TipoItemEnum.MANO_OBRA, "Mano de obra frenos", Decimal("1"), Decimal("60.00")
        )
        _add_detalle_if_missing(
            db, ot3.id, TipoItemEnum.REPUESTO, "Aceite ABD", Decimal("3"), Decimal("28.00"), productos[2].id
        )

        for ot in (ot1, ot2, ot3):
            rows = (
                db.query(DetalleOrden.subtotal)
                .filter(DetalleOrden.orden_id == ot.id)
                .all()
            )
            monto = sum(Decimal(value) for (value,) in rows) if rows else Decimal("0")
            ot.total_estimado = monto
            db.add(ot)
        db.commit()

        _ensure_factura(db, ot3, Decimal("10.00"))
        print("Seed ABD minimos ejecutado correctamente.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
