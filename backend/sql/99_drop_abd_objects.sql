-- Limpieza de objetos ABD (vistas, rutinas y triggers).

-- Triggers
DROP TRIGGER IF EXISTS trg_facturas_ai_descuento_stock;
DROP TRIGGER IF EXISTS trg_historial_precios_bu_unico_rango;
DROP TRIGGER IF EXISTS trg_detalle_orden_bi_subtotal;

-- Procedimientos
DROP PROCEDURE IF EXISTS sp_revertir_factura;
DROP PROCEDURE IF EXISTS sp_facturar_orden;
DROP PROCEDURE IF EXISTS sp_generar_alertas_stock_bajo;
DROP PROCEDURE IF EXISTS sp_recalcular_totales_ot_cursores;
DROP PROCEDURE IF EXISTS sp_actualizar_precio_producto;
DROP PROCEDURE IF EXISTS sp_buscar_clientes;

-- Funciones
DROP FUNCTION IF EXISTS fn_normalizar_placa;
DROP FUNCTION IF EXISTS fn_kpi_ingresos_mes;
DROP FUNCTION IF EXISTS fn_precio_vigente;

-- Vistas
DROP VIEW IF EXISTS vw_kpi_mensual;
DROP VIEW IF EXISTS vw_stock_bajo;
DROP VIEW IF EXISTS vw_ordenes_detalladas;

-- Tablas auxiliares
DROP TABLE IF EXISTS pagos;
DROP TABLE IF EXISTS alertas_inventario;
