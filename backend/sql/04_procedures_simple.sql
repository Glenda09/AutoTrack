-- Procedimientos simples sin cursores ni transacciones explicitas.

DROP PROCEDURE IF EXISTS sp_buscar_clientes;
DELIMITER $$
CREATE PROCEDURE sp_buscar_clientes(IN p_search VARCHAR(100))
BEGIN
  DECLARE v_pattern VARCHAR(110);
  SET v_pattern = CONCAT('%%', COALESCE(p_search, ''), '%%');

  SELECT id, nombre, telefono, nit
    FROM clientes
   WHERE nombre LIKE v_pattern
      OR telefono LIKE v_pattern
      OR nit LIKE v_pattern
   ORDER BY nombre
   LIMIT 50;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_actualizar_precio_producto;
DELIMITER $$
CREATE PROCEDURE sp_actualizar_precio_producto(
  IN p_producto_id INT,
  IN p_precio DECIMAL(10,2),
  IN p_costo DECIMAL(10,2)
)
BEGIN
  DECLARE v_now DATETIME;
  DECLARE v_exists INT DEFAULT 0;
  SET v_now = NOW();

  SELECT COUNT(*) INTO v_exists FROM productos WHERE id = p_producto_id;
  IF v_exists = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Producto no existe';
  END IF;

  -- Cierra rango vigente.
  UPDATE historial_precios
     SET fecha_fin = v_now
   WHERE producto_id = p_producto_id
     AND fecha_fin IS NULL;

  -- Abre nuevo rango activo.
  INSERT INTO historial_precios (producto_id, fecha_inicio, fecha_fin, precio_unitario, costo_unitario)
  VALUES (p_producto_id, v_now, NULL, p_precio, p_costo);
END$$
DELIMITER ;
