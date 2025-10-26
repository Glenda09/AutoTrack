"""init schema

Revision ID: 0001_init
Revises:
Create Date: 2025-10-11 21:47:00.000000
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0001_init"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "roles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=50), nullable=False),
        sa.Column("description", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    op.create_table(
        "usuarios",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("username", sa.String(length=50), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("nombre_completo", sa.String(length=150), nullable=False),
        sa.Column("email", sa.String(length=150), nullable=True),
        sa.Column("rol_id", sa.Integer(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["rol_id"], ["roles.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_usuarios_username"), "usuarios", ["username"], unique=True)
    op.create_index(op.f("ix_usuarios_id"), "usuarios", ["id"], unique=False)

    op.create_table(
        "clientes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nombre", sa.String(length=150), nullable=False),
        sa.Column("direccion", sa.String(length=255), nullable=True),
        sa.Column(
            "tipo_cliente",
            sa.Enum("Natural", "Juridico", name="tipoclienteenum"),
            nullable=False,
        ),
        sa.Column("telefono", sa.String(length=50), nullable=True),
        sa.Column("email", sa.String(length=150), nullable=True),
        sa.Column("nit", sa.String(length=50), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_clientes_nombre", "clientes", ["nombre"], unique=False)
    op.create_index("ix_clientes_telefono", "clientes", ["telefono"], unique=False)
    op.create_index("ix_clientes_nit", "clientes", ["nit"], unique=False)

    op.create_table(
        "productos",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("sku", sa.String(length=50), nullable=False),
        sa.Column("nombre", sa.String(length=150), nullable=False),
        sa.Column("descripcion", sa.String(length=255), nullable=True),
        sa.Column("stock_actual", sa.Numeric(10, 2), nullable=False),
        sa.Column("stock_reservado", sa.Numeric(10, 2), nullable=False),
        sa.Column("stock_minimo", sa.Numeric(10, 2), nullable=False),
        sa.Column("ubicacion", sa.String(length=100), nullable=True),
        sa.Column("proveedor_principal", sa.String(length=150), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("sku"),
    )
    op.create_index("ix_productos_nombre", "productos", ["nombre"], unique=False)

    op.create_table(
        "vehiculos",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("placa", sa.String(length=15), nullable=False),
        sa.Column("marca", sa.String(length=100), nullable=False),
        sa.Column("modelo", sa.String(length=100), nullable=False),
        sa.Column("anio", sa.Integer(), nullable=False),
        sa.Column("color", sa.String(length=50), nullable=True),
        sa.Column("cliente_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["cliente_id"], ["clientes.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("placa"),
    )

    op.create_table(
        "historial_precios",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("producto_id", sa.Integer(), nullable=False),
        sa.Column("fecha_inicio", sa.DateTime(), nullable=False),
        sa.Column("fecha_fin", sa.DateTime(), nullable=True),
        sa.Column("precio_unitario", sa.Numeric(10, 2), nullable=False),
        sa.Column("costo_unitario", sa.Numeric(10, 2), nullable=False),
        sa.ForeignKeyConstraint(["producto_id"], ["productos.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "ordenes_trabajo",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("vehiculo_id", sa.Integer(), nullable=False),
        sa.Column("usuario_responsable_id", sa.Integer(), nullable=True),
        sa.Column("fecha_creacion", sa.DateTime(), nullable=False),
        sa.Column("descripcion", sa.Text(), nullable=True),
        sa.Column(
            "estado",
            sa.Enum("Pendiente", "EnProceso", "Completada", "Entregada", name="estadoordenenum"),
            nullable=False,
        ),
        sa.Column("fecha_entrega", sa.DateTime(), nullable=True),
        sa.Column("total_estimado", sa.Numeric(10, 2), nullable=False),
        sa.Column("lista_para_facturar", sa.Boolean(), nullable=False),
        sa.Column("confirmada", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["usuario_responsable_id"], ["usuarios.id"]),
        sa.ForeignKeyConstraint(["vehiculo_id"], ["vehiculos.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "detalle_orden",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("orden_id", sa.Integer(), nullable=False),
        sa.Column(
            "tipo_item",
            sa.Enum("Repuesto", "ManoObra", "ServicioExterno", name="tipoitemenum"),
            nullable=False,
        ),
        sa.Column("producto_id", sa.Integer(), nullable=True),
        sa.Column("descripcion", sa.String(length=255), nullable=True),
        sa.Column("cantidad", sa.Numeric(10, 2), nullable=False),
        sa.Column("precio_unitario", sa.Numeric(10, 2), nullable=False),
        sa.Column("subtotal", sa.Numeric(10, 2), nullable=False),
        sa.ForeignKeyConstraint(["orden_id"], ["ordenes_trabajo.id"]),
        sa.ForeignKeyConstraint(["producto_id"], ["productos.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "facturas",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("orden_id", sa.Integer(), nullable=False),
        sa.Column("fecha_factura", sa.DateTime(), nullable=False),
        sa.Column("monto_total", sa.Numeric(10, 2), nullable=False),
        sa.Column("impuesto_aplicado", sa.Numeric(10, 2), nullable=False),
        sa.Column("metodo_pago", sa.String(length=100), nullable=False),
        sa.Column("metodos_pago", sa.JSON(), nullable=False),
        sa.Column("estado_pago", sa.Enum("Pagada", "Pendiente", "Parcial", name="estadopagoenum"), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["orden_id"], ["ordenes_trabajo.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("orden_id"),
    )

    op.create_table(
        "citas",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("cliente_id", sa.Integer(), nullable=False),
        sa.Column("vehiculo_id", sa.Integer(), nullable=True),
        sa.Column("fecha_inicio", sa.DateTime(), nullable=False),
        sa.Column("fecha_fin", sa.DateTime(), nullable=False),
        sa.Column("nota", sa.Text(), nullable=True),
        sa.Column(
            "estado",
            sa.Enum("Programada", "Atendida", "Cancelada", name="estadocitaenum"),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["cliente_id"], ["clientes.id"]),
        sa.ForeignKeyConstraint(["vehiculo_id"], ["vehiculos.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "audit_log",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("usuario_id", sa.Integer(), nullable=True),
        sa.Column("entidad", sa.String(length=100), nullable=False),
        sa.Column("entidad_id", sa.Integer(), nullable=True),
        sa.Column("accion", sa.String(length=50), nullable=False),
        sa.Column("ts", sa.DateTime(), nullable=False),
        sa.Column("payload", sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuarios.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("audit_log")
    op.drop_table("citas")
    op.drop_table("facturas")
    op.drop_table("detalle_orden")
    op.drop_table("ordenes_trabajo")
    op.drop_table("historial_precios")
    op.drop_table("vehiculos")
    op.drop_index("ix_productos_nombre", table_name="productos")
    op.drop_table("productos")
    op.drop_index("ix_clientes_nit", table_name="clientes")
    op.drop_index("ix_clientes_telefono", table_name="clientes")
    op.drop_index("ix_clientes_nombre", table_name="clientes")
    op.drop_table("clientes")
    op.drop_index(op.f("ix_usuarios_id"), table_name="usuarios")
    op.drop_index(op.f("ix_usuarios_username"), table_name="usuarios")
    op.drop_table("usuarios")
    op.drop_table("roles")
