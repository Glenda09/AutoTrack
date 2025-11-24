-- Procedimientos con control transaccional y manejo de errores.

DROP PROCEDURE IF EXISTS sp_facturar_orden;
DELIMITER $$
CREATE PROCEDURE sp_facturar_orden(
  IN p_ot_id INT,
  IN p_impuesto DECIMAL(10,2),
  IN p_metodo_pago VARCHAR(30)
)
BEGIN
  DECLARE v_total DECIMAL(12,2) DEFAULT 0;
  DECLARE v_estado VARCHAR(20);
  DECLARE v_facturas INT DEFAULT 0;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  SELECT estado INTO v_estado FROM ordenes_trabajo WHERE id = p_ot_id FOR UPDATE;
  IF v_estado IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Orden no existe';
  END IF;

  SELECT COUNT(*) INTO v_facturas FROM facturas WHERE orden_id = p_ot_id;
  IF v_facturas > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Orden ya facturada';
  END IF;

  IF EXISTS (
    SELECT 1
      FROM detalle_orden d
      JOIN productos p ON p.id = d.producto_id
     WHERE d.orden_id = p_ot_id
       AND d.tipo_item = 'Repuesto'
       AND (p.stock_actual - d.cantidad) < 0
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock insuficiente para facturar';
  END IF;

  SELECT COALESCE(SUM(subtotal), 0) INTO v_total FROM detalle_orden WHERE orden_id = p_ot_id;
  IF v_total = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Orden sin detalle para facturar';
  END IF;

  INSERT INTO facturas (
    orden_id, monto_total, impuesto_aplicado, metodo_pago, metodos_pago, estado_pago, fecha_factura
  ) VALUES (
    p_ot_id,
    v_total + p_impuesto,
    p_impuesto,
    p_metodo_pago,
    JSON_ARRAY(p_metodo_pago),
    'Pagada',
    NOW()
  );
  INSERT INTO pagos (factura_id, metodo, monto, ts)
  VALUES (LAST_INSERT_ID(), p_metodo_pago, v_total + p_impuesto, NOW());

  UPDATE ordenes_trabajo
     SET estado = 'Entregada',
         lista_para_facturar = 0,
         confirmada = 1,
         updated_at = NOW()
   WHERE id = p_ot_id;

  COMMIT;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_revertir_factura;
DELIMITER $$
CREATE PROCEDURE sp_revertir_factura(IN p_factura_id INT)
BEGIN
  DECLARE v_ot_id INT;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;
  SELECT orden_id INTO v_ot_id FROM facturas WHERE id = p_factura_id FOR UPDATE;
  IF v_ot_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Factura no existe';
  END IF;

  UPDATE productos p
  JOIN detalle_orden d ON d.producto_id = p.id
     SET p.stock_actual = p.stock_actual + d.cantidad,
         p.updated_at = NOW()
   WHERE d.orden_id = v_ot_id
     AND d.tipo_item = 'Repuesto';

  DELETE FROM facturas WHERE id = p_factura_id;

  UPDATE ordenes_trabajo
     SET estado = 'Completada',
         lista_para_facturar = 1,
         updated_at = NOW()
   WHERE id = v_ot_id;

  COMMIT;
END$$
DELIMITER ;
