-- Ajustes de esquema para objetos ABD y tablas de soporte.

-- Tabla de alertas de inventario usada por cursores y triggers.
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

-- Pagos parciales para facturas.
CREATE TABLE IF NOT EXISTS pagos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  factura_id INT NOT NULL,
  metodo VARCHAR(30) NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pagos_factura (factura_id),
  CONSTRAINT fk_pagos_factura FOREIGN KEY (factura_id) REFERENCES facturas (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Indices adicionales con verificacion previa.
SET @sql_ix1 := (
  SELECT IF(
    EXISTS(
      SELECT 1 FROM information_schema.statistics
      WHERE table_schema = DATABASE() AND table_name = 'facturas' AND index_name = 'ix_facturas_fecha_factura'
    ),
    'SELECT 1',
    'CREATE INDEX ix_facturas_fecha_factura ON facturas (fecha_factura)'
  )
);
PREPARE stmt1 FROM @sql_ix1;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

SET @sql_ix2 := (
  SELECT IF(
    EXISTS(
      SELECT 1 FROM information_schema.statistics
      WHERE table_schema = DATABASE() AND table_name = 'productos' AND index_name = 'ix_productos_stock_minimo'
    ),
    'SELECT 1',
    'CREATE INDEX ix_productos_stock_minimo ON productos (stock_minimo)'
  )
);
PREPARE stmt2 FROM @sql_ix2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;
