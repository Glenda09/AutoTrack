-- Vistas analiticas para reportes ABD.
-- Precondicion: tablas base creadas por migraciones iniciales.

-- Tabla auxiliar para alertas de inventario consumida por SP con cursores.
CREATE TABLE IF NOT EXISTS alertas_inventario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  nivel VARCHAR(20) DEFAULT 'Bajo',
  mensaje VARCHAR(255) NOT NULL,
  ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_alertas_producto_ts (producto_id, ts),
  CONSTRAINT fk_alertas_producto FOREIGN KEY (producto_id) REFERENCES productos (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Vista: detalle de OT con totales agregados y dias abierta.
DROP VIEW IF EXISTS vw_ordenes_detalladas;
CREATE OR REPLACE VIEW vw_ordenes_detalladas AS
SELECT
  ot.id AS ot_id,
  v.placa AS placa,
  c.nombre AS cliente_nombre,
  ot.estado AS estado,
  d.subtotal AS subtotal_linea,
  SUM(d.subtotal) OVER (PARTITION BY ot.id) AS total_ot,
  DATEDIFF(CURDATE(), DATE(ot.fecha_creacion)) AS dias_abierta
FROM ordenes_trabajo ot
JOIN detalle_orden d ON d.orden_id = ot.id
JOIN vehiculos v ON v.id = ot.vehiculo_id
JOIN clientes c ON c.id = v.cliente_id
LEFT JOIN usuarios u ON u.id = ot.usuario_responsable_id;

-- Vista: productos con stock en nivel critico y ultima fecha de movimiento/precio.
DROP VIEW IF EXISTS vw_stock_bajo;
CREATE OR REPLACE VIEW vw_stock_bajo AS
SELECT
  base.producto_id,
  base.sku,
  base.nombre,
  base.stock_actual,
  base.stock_minimo,
  base.ultima_fecha_movimiento,
  COALESCE(DATEDIFF(CURDATE(), base.ultima_fecha_movimiento), 0) AS dias_sin_movimiento
FROM (
  SELECT
    p.id AS producto_id,
    p.sku,
    p.nombre,
    p.stock_actual,
    p.stock_minimo,
    GREATEST(
      COALESCE(MAX(hp.fecha_fin), '1000-01-01'),
      COALESCE(MAX(hp.fecha_inicio), '1000-01-01'),
      COALESCE(MAX(ot.updated_at), '1000-01-01'),
      COALESCE(MAX(p.updated_at), '1000-01-01'),
      COALESCE(MAX(p.created_at), '1000-01-01')
    ) AS ultima_fecha_movimiento
  FROM productos p
  LEFT JOIN historial_precios hp ON hp.producto_id = p.id
  LEFT JOIN detalle_orden d ON d.producto_id = p.id
  LEFT JOIN ordenes_trabajo ot ON ot.id = d.orden_id
  GROUP BY p.id, p.sku, p.nombre, p.stock_actual, p.stock_minimo, p.updated_at, p.created_at
) AS base
WHERE base.stock_actual <= base.stock_minimo;

-- Vista: KPIs mensuales de facturacion y uso de repuestos.
DROP VIEW IF EXISTS vw_kpi_mensual;
CREATE OR REPLACE VIEW vw_kpi_mensual AS
SELECT
  YEAR(f.fecha_factura) AS anio,
  MONTH(f.fecha_factura) AS mes,
  SUM(f.monto_total) AS total_facturado,
  COUNT(DISTINCT CASE WHEN ot.estado IN ('Completada', 'Entregada') THEN ot.id END) AS ots_cerradas,
  COALESCE(SUM(CASE WHEN d.tipo_item = 'Repuesto' THEN d.cantidad ELSE 0 END), 0) AS repuestos_usados,
  AVG(f.monto_total) AS ticket_promedio
FROM facturas f
JOIN ordenes_trabajo ot ON ot.id = f.orden_id
LEFT JOIN detalle_orden d ON d.orden_id = ot.id
GROUP BY YEAR(f.fecha_factura), MONTH(f.fecha_factura)
ORDER BY anio, mes;
