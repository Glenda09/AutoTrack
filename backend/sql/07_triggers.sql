-- Triggers para reglas de negocio y auditoria ABD.

-- Calcula subtotal y precio por defecto antes de insertar lineas de OT.
DROP TRIGGER IF EXISTS trg_detalle_orden_bi_subtotal;
DELIMITER $$
CREATE TRIGGER trg_detalle_orden_bi_subtotal
BEFORE INSERT ON detalle_orden
FOR EACH ROW
BEGIN
  IF NEW.tipo_item = 'Repuesto' AND NEW.producto_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Producto requerido para repuesto';
  END IF;
  IF NEW.tipo_item = 'Repuesto' AND NEW.precio_unitario IS NULL THEN
    SET NEW.precio_unitario = fn_precio_vigente(NEW.producto_id, CURDATE());
    IF NEW.precio_unitario IS NULL THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Precio vigente no encontrado';
    END IF;
  END IF;
  SET NEW.subtotal = NEW.cantidad * COALESCE(NEW.precio_unitario, 0);
END$$
DELIMITER ;

-- Previene rangos solapados en historial de precios durante actualizaciones.
DROP TRIGGER IF EXISTS trg_historial_precios_bu_unico_rango;
DELIMITER $$
CREATE TRIGGER trg_historial_precios_bu_unico_rango
BEFORE UPDATE ON historial_precios
FOR EACH ROW
BEGIN
  IF NEW.fecha_fin IS NOT NULL AND NEW.fecha_fin <= NEW.fecha_inicio THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Rango de precio invalido';
  END IF;

  IF EXISTS (
    SELECT 1
      FROM historial_precios hp
     WHERE hp.producto_id = NEW.producto_id
       AND hp.id <> OLD.id
       AND (NEW.fecha_fin IS NULL OR hp.fecha_inicio < NEW.fecha_fin)
       AND (hp.fecha_fin IS NULL OR hp.fecha_fin > NEW.fecha_inicio)
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Rango de precio solapado';
  END IF;
END$$
DELIMITER ;

-- Descuenta stock tras facturar y registra auditoria.
DROP TRIGGER IF EXISTS trg_facturas_ai_descuento_stock;
DELIMITER $$
CREATE TRIGGER trg_facturas_ai_descuento_stock
AFTER INSERT ON facturas
FOR EACH ROW
BEGIN
  DECLARE v_negativos INT DEFAULT 0;

  SELECT COUNT(*)
    INTO v_negativos
    FROM detalle_orden d
    JOIN productos p ON p.id = d.producto_id
   WHERE d.orden_id = NEW.orden_id
     AND d.tipo_item = 'Repuesto'
     AND (p.stock_actual - d.cantidad) < 0;

  IF v_negativos > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock insuficiente al facturar';
  END IF;

  UPDATE productos p
  JOIN detalle_orden d ON d.producto_id = p.id
     SET p.stock_actual = p.stock_actual - d.cantidad,
         p.updated_at = NOW()
   WHERE d.orden_id = NEW.orden_id
     AND d.tipo_item = 'Repuesto';

  INSERT INTO alertas_inventario (producto_id, nivel, mensaje, ts)
  SELECT
    p.id,
    'Bajo',
    CONCAT('Stock bajo tras facturar: ', p.stock_actual, '/', p.stock_minimo),
    NOW()
  FROM productos p
  JOIN detalle_orden d ON d.producto_id = p.id
  WHERE d.orden_id = NEW.orden_id
    AND d.tipo_item = 'Repuesto'
    AND p.stock_actual < p.stock_minimo;

  INSERT INTO audit_log (usuario_id, entidad, entidad_id, accion, ts, payload)
  VALUES (
    NULL,
    'facturas',
    NEW.id,
    'create',
    NOW(),
    (
      SELECT JSON_OBJECT(
        'factura_id', NEW.id,
        'orden_id', NEW.orden_id,
        'lineas',
        COALESCE(
          JSON_ARRAYAGG(
            JSON_OBJECT('producto_id', d.producto_id, 'cantidad', d.cantidad, 'subtotal', d.subtotal)
          ),
          JSON_ARRAY()
        )
      )
      FROM detalle_orden d
      WHERE d.orden_id = NEW.orden_id
        AND d.tipo_item = 'Repuesto'
    )
  );
END$$
DELIMITER ;
