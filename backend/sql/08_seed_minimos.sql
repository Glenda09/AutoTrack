-- Datos minimos para probar objetos ABD en MySQL.
SET @now := NOW();

-- Roles y usuario administrador.
INSERT INTO roles (name, description, created_at, updated_at)
VALUES 
  ('Admin', 'Acceso total', @now, @now),
  ('Facturacion', 'Gestiona facturacion', @now, @now),
  ('Inventario', 'Gestiona inventario', @now, @now)
ON DUPLICATE KEY UPDATE description = VALUES(description), updated_at = VALUES(updated_at);

SET @admin_rol_id := (SELECT id FROM roles WHERE name = 'Admin' LIMIT 1);
INSERT INTO usuarios (username, hashed_password, nombre_completo, email, rol_id, is_active, created_at, updated_at)
SELECT 'admin', '$pbkdf2-sha256$29000$BCCEkHLuvReiNIaQMmYMIQ$v69IBntqCgEwp6ZwUjJSUIzU60YoNYsOoPz1HTxKwZY', 'Administrador ABD', 'admin+abd@example.com', @admin_rol_id, 1, @now, @now
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE username = 'admin');

-- Clientes y vehiculos.
INSERT INTO clientes (nombre, direccion, tipo_cliente, telefono, email, nit, is_active, created_at, updated_at)
SELECT 'Cliente ABD 1', 'Calle 1', 'Natural', '555-1001', 'c1@abd.test', 'NIT-ABD-01', 1, @now, @now
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE nit = 'NIT-ABD-01');
INSERT INTO clientes (nombre, direccion, tipo_cliente, telefono, email, nit, is_active, created_at, updated_at)
SELECT 'Cliente ABD 2', 'Calle 2', 'Natural', '555-1002', 'c2@abd.test', 'NIT-ABD-02', 1, @now, @now
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE nit = 'NIT-ABD-02');
INSERT INTO clientes (nombre, direccion, tipo_cliente, telefono, email, nit, is_active, created_at, updated_at)
SELECT 'Cliente ABD 3', 'Calle 3', 'Natural', '555-1003', 'c3@abd.test', 'NIT-ABD-03', 1, @now, @now
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE nit = 'NIT-ABD-03');
INSERT INTO clientes (nombre, direccion, tipo_cliente, telefono, email, nit, is_active, created_at, updated_at)
SELECT 'Cliente ABD 4', 'Calle 4', 'Natural', '555-1004', 'c4@abd.test', 'NIT-ABD-04', 1, @now, @now
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE nit = 'NIT-ABD-04');
INSERT INTO clientes (nombre, direccion, tipo_cliente, telefono, email, nit, is_active, created_at, updated_at)
SELECT 'Cliente ABD 5', 'Calle 5', 'Natural', '555-1005', 'c5@abd.test', 'NIT-ABD-05', 1, @now, @now
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE nit = 'NIT-ABD-05');

SET @veh1_cliente := (SELECT id FROM clientes WHERE nit = 'NIT-ABD-01');
SET @veh2_cliente := (SELECT id FROM clientes WHERE nit = 'NIT-ABD-02');
SET @veh3_cliente := (SELECT id FROM clientes WHERE nit = 'NIT-ABD-03');

INSERT INTO vehiculos (placa, marca, modelo, anio, color, cliente_id, created_at, updated_at)
SELECT 'ABD-001', 'Toyota', 'Corolla', 2020, 'Rojo', @veh1_cliente, @now, @now
WHERE NOT EXISTS (SELECT 1 FROM vehiculos WHERE placa = 'ABD-001');
INSERT INTO vehiculos (placa, marca, modelo, anio, color, cliente_id, created_at, updated_at)
SELECT 'ABD-002', 'Nissan', 'Sentra', 2019, 'Azul', @veh2_cliente, @now, @now
WHERE NOT EXISTS (SELECT 1 FROM vehiculos WHERE placa = 'ABD-002');
INSERT INTO vehiculos (placa, marca, modelo, anio, color, cliente_id, created_at, updated_at)
SELECT 'ABD-003', 'Mazda', '3', 2021, 'Gris', @veh3_cliente, @now, @now
WHERE NOT EXISTS (SELECT 1 FROM vehiculos WHERE placa = 'ABD-003');

-- Productos y precios vigentes.
INSERT INTO productos (sku, nombre, descripcion, stock_actual, stock_reservado, stock_minimo, ubicacion, proveedor_principal, is_active, created_at, updated_at)
VALUES
  ('SKU-ABD-01', 'Filtro de aceite', 'Filtro motor', 25, 0, 5, 'A1', 'Proveedor Demo', 1, @now, @now),
  ('SKU-ABD-02', 'Pastillas de freno', 'Set frenos', 8, 0, 10, 'A2', 'Proveedor Demo', 1, @now, @now),
  ('SKU-ABD-03', 'Aceite 10W40', 'Aceite sintetico', 50, 0, 15, 'A3', 'Proveedor Demo', 1, @now, @now),
  ('SKU-ABD-04', 'Bujia', 'Bujia estandar', 12, 0, 10, 'A4', 'Proveedor Demo', 1, @now, @now),
  ('SKU-ABD-05', 'Filtro de aire', 'Filtro cabina', 5, 0, 8, 'A5', 'Proveedor Demo', 1, @now, @now),
  ('SKU-ABD-06', 'Correa', 'Correa de alternador', 7, 0, 6, 'A6', 'Proveedor Demo', 1, @now, @now),
  ('SKU-ABD-07', 'Amortiguador', 'Amortiguador delantero', 4, 0, 3, 'A7', 'Proveedor Demo', 1, @now, @now),
  ('SKU-ABD-08', 'Liquido de frenos', 'DOT 4', 18, 0, 10, 'A8', 'Proveedor Demo', 1, @now, @now)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), descripcion = VALUES(descripcion), updated_at = VALUES(updated_at);

INSERT INTO historial_precios (producto_id, fecha_inicio, fecha_fin, precio_unitario, costo_unitario)
SELECT p.id, DATE_SUB(CURDATE(), INTERVAL 15 DAY), NULL, 35.50, 20.00
FROM productos p
WHERE p.sku = 'SKU-ABD-01'
  AND NOT EXISTS (
    SELECT 1 FROM historial_precios hp WHERE hp.producto_id = p.id AND hp.fecha_fin IS NULL
  );
INSERT INTO historial_precios (producto_id, fecha_inicio, fecha_fin, precio_unitario, costo_unitario)
SELECT p.id, DATE_SUB(CURDATE(), INTERVAL 10 DAY), NULL, 55.00, 30.00
FROM productos p
WHERE p.sku = 'SKU-ABD-02'
  AND NOT EXISTS (SELECT 1 FROM historial_precios hp WHERE hp.producto_id = p.id AND hp.fecha_fin IS NULL);
INSERT INTO historial_precios (producto_id, fecha_inicio, fecha_fin, precio_unitario, costo_unitario)
SELECT p.id, DATE_SUB(CURDATE(), INTERVAL 20 DAY), NULL, 28.00, 15.00
FROM productos p
WHERE p.sku = 'SKU-ABD-03'
  AND NOT EXISTS (SELECT 1 FROM historial_precios hp WHERE hp.producto_id = p.id AND hp.fecha_fin IS NULL);

-- Ordenes de trabajo base.
SET @veh1_id := (SELECT id FROM vehiculos WHERE placa = 'ABD-001');
SET @veh2_id := (SELECT id FROM vehiculos WHERE placa = 'ABD-002');
SET @veh3_id := (SELECT id FROM vehiculos WHERE placa = 'ABD-003');
SET @admin_user := (SELECT id FROM usuarios WHERE username = 'admin');

INSERT INTO ordenes_trabajo (vehiculo_id, usuario_responsable_id, fecha_creacion, descripcion, estado, fecha_entrega, total_estimado, lista_para_facturar, confirmada, created_at, updated_at)
SELECT @veh1_id, @admin_user, DATE_SUB(@now, INTERVAL 2 DAY), 'OT ABD - Cambio aceite', 'EnProceso', DATE_ADD(@now, INTERVAL 1 DAY), 0, 1, 1, @now, @now
WHERE NOT EXISTS (SELECT 1 FROM ordenes_trabajo WHERE descripcion = 'OT ABD - Cambio aceite');
INSERT INTO ordenes_trabajo (vehiculo_id, usuario_responsable_id, fecha_creacion, descripcion, estado, fecha_entrega, total_estimado, lista_para_facturar, confirmada, created_at, updated_at)
SELECT @veh2_id, @admin_user, DATE_SUB(@now, INTERVAL 5 DAY), 'OT ABD - Frenos', 'Pendiente', DATE_ADD(@now, INTERVAL 3 DAY), 0, 0, 0, @now, @now
WHERE NOT EXISTS (SELECT 1 FROM ordenes_trabajo WHERE descripcion = 'OT ABD - Frenos');
INSERT INTO ordenes_trabajo (vehiculo_id, usuario_responsable_id, fecha_creacion, descripcion, estado, fecha_entrega, total_estimado, lista_para_facturar, confirmada, created_at, updated_at)
SELECT @veh3_id, @admin_user, DATE_SUB(@now, INTERVAL 7 DAY), 'OT ABD - Lista para facturar', 'Completada', DATE_ADD(@now, INTERVAL 1 DAY), 0, 1, 1, @now, @now
WHERE NOT EXISTS (SELECT 1 FROM ordenes_trabajo WHERE descripcion = 'OT ABD - Lista para facturar');

SET @ot1 := (SELECT id FROM ordenes_trabajo WHERE descripcion = 'OT ABD - Cambio aceite');
SET @ot2 := (SELECT id FROM ordenes_trabajo WHERE descripcion = 'OT ABD - Frenos');
SET @ot3 := (SELECT id FROM ordenes_trabajo WHERE descripcion = 'OT ABD - Lista para facturar');
SET @prod1 := (SELECT id FROM productos WHERE sku = 'SKU-ABD-01');
SET @prod2 := (SELECT id FROM productos WHERE sku = 'SKU-ABD-02');
SET @prod3 := (SELECT id FROM productos WHERE sku = 'SKU-ABD-03');

INSERT INTO detalle_orden (orden_id, tipo_item, producto_id, descripcion, cantidad, precio_unitario, subtotal)
SELECT @ot1, 'Repuesto', @prod1, 'Filtro ABD', 1, fn_precio_vigente(@prod1, CURDATE()), fn_precio_vigente(@prod1, CURDATE())
WHERE NOT EXISTS (SELECT 1 FROM detalle_orden WHERE orden_id = @ot1 AND descripcion = 'Filtro ABD');
INSERT INTO detalle_orden (orden_id, tipo_item, descripcion, cantidad, precio_unitario, subtotal)
SELECT @ot1, 'ManoObra', 'Mano de obra ABD', 1, 40.00, 40.00
WHERE NOT EXISTS (SELECT 1 FROM detalle_orden WHERE orden_id = @ot1 AND descripcion = 'Mano de obra ABD');

INSERT INTO detalle_orden (orden_id, tipo_item, producto_id, descripcion, cantidad, precio_unitario, subtotal)
SELECT @ot2, 'Repuesto', @prod2, 'Pastillas ABD', 2, fn_precio_vigente(@prod2, CURDATE()), 2 * fn_precio_vigente(@prod2, CURDATE())
WHERE NOT EXISTS (SELECT 1 FROM detalle_orden WHERE orden_id = @ot2 AND descripcion = 'Pastillas ABD');
INSERT INTO detalle_orden (orden_id, tipo_item, descripcion, cantidad, precio_unitario, subtotal)
SELECT @ot2, 'ManoObra', 'Mano de obra frenos', 1, 60.00, 60.00
WHERE NOT EXISTS (SELECT 1 FROM detalle_orden WHERE orden_id = @ot2 AND descripcion = 'Mano de obra frenos');

INSERT INTO detalle_orden (orden_id, tipo_item, producto_id, descripcion, cantidad, precio_unitario, subtotal)
SELECT @ot3, 'Repuesto', @prod3, 'Aceite ABD', 3, fn_precio_vigente(@prod3, CURDATE()), 3 * fn_precio_vigente(@prod3, CURDATE())
WHERE NOT EXISTS (SELECT 1 FROM detalle_orden WHERE orden_id = @ot3 AND descripcion = 'Aceite ABD');

UPDATE ordenes_trabajo ot
JOIN (
  SELECT orden_id, SUM(subtotal) AS total FROM detalle_orden GROUP BY orden_id
) d ON d.orden_id = ot.id
   SET ot.total_estimado = d.total,
       ot.updated_at = @now;

-- Factura minima (solo se inserta una vez para no duplicar descuento de stock).
INSERT INTO facturas (orden_id, fecha_factura, monto_total, impuesto_aplicado, metodo_pago, metodos_pago, estado_pago, created_at, updated_at)
SELECT @ot3, @now, (SELECT SUM(subtotal) FROM detalle_orden WHERE orden_id = @ot3) + 10, 10, 'Efectivo', JSON_ARRAY('Efectivo'), 'Pagada', @now, @now
WHERE NOT EXISTS (SELECT 1 FROM facturas WHERE orden_id = @ot3);
