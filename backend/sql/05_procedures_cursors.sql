-- Procedimientos que utilizan cursores para recorrer conjuntos de datos.

DROP PROCEDURE IF EXISTS sp_recalcular_totales_ot_cursores;
DELIMITER $$
CREATE PROCEDURE sp_recalcular_totales_ot_cursores(IN p_ot_id INT)
BEGIN
  DECLARE v_done INT DEFAULT 0;
  DECLARE v_detalle_id INT;
  DECLARE v_cantidad DECIMAL(10,2);
  DECLARE v_precio DECIMAL(10,2);
  DECLARE v_total DECIMAL(12,2) DEFAULT 0;

  DECLARE cur_detalles CURSOR FOR
    SELECT id, cantidad, precio_unitario FROM detalle_orden WHERE orden_id = p_ot_id;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;

  IF NOT EXISTS (SELECT 1 FROM ordenes_trabajo WHERE id = p_ot_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'OT no existe';
  END IF;

  OPEN cur_detalles;
  detalles_loop: LOOP
    FETCH cur_detalles INTO v_detalle_id, v_cantidad, v_precio;
    IF v_done = 1 THEN
      LEAVE detalles_loop;
    END IF;
    UPDATE detalle_orden
       SET subtotal = v_cantidad * v_precio
     WHERE id = v_detalle_id;
    SET v_total = v_total + (v_cantidad * v_precio);
  END LOOP;
  CLOSE cur_detalles;

  UPDATE ordenes_trabajo
     SET total_estimado = v_total,
         updated_at = NOW()
   WHERE id = p_ot_id;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_generar_alertas_stock_bajo;
DELIMITER $$
CREATE PROCEDURE sp_generar_alertas_stock_bajo()
BEGIN
  DECLARE v_done INT DEFAULT 0;
  DECLARE v_producto_id INT;
  DECLARE v_stock_actual DECIMAL(10,2);
  DECLARE v_stock_minimo DECIMAL(10,2);
  DECLARE v_dias INT;

  DECLARE cur_bajo CURSOR FOR
    SELECT producto_id, stock_actual, stock_minimo, dias_sin_movimiento FROM vw_stock_bajo;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;

  OPEN cur_bajo;
  bajo_loop: LOOP
    FETCH cur_bajo INTO v_producto_id, v_stock_actual, v_stock_minimo, v_dias;
    IF v_done = 1 THEN
      LEAVE bajo_loop;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM alertas_inventario
       WHERE producto_id = v_producto_id
         AND DATE(ts) = CURDATE()
    ) THEN
      INSERT INTO alertas_inventario (producto_id, nivel, mensaje, ts)
      VALUES (
        v_producto_id,
        'Bajo',
        NOW(),
        CONCAT('Stock bajo: ', v_stock_actual, '/', v_stock_minimo, ' sin mov ', v_dias, 'd')
      );
    END IF;
  END LOOP;
  CLOSE cur_bajo;
END$$
DELIMITER ;
