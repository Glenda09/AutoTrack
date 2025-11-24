-- Validaciones minimas del esquema base requerido por objetos ABD.
-- Falla temprano si las tablas o columnas clave no estan disponibles.
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_assert_core_schema$$
CREATE PROCEDURE sp_assert_core_schema()
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'ordenes_trabajo') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Falta tabla ordenes_trabajo';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'detalle_orden') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Falta tabla detalle_orden';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'productos') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Falta tabla productos';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'detalle_orden' AND column_name = 'subtotal'
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Falta columna detalle_orden.subtotal';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'facturas' AND column_name = 'orden_id'
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Falta relacion facturas.orden_id';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'historial_precios' AND column_name = 'fecha_fin'
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Falta columna historial_precios.fecha_fin';
  END IF;
END$$
CALL sp_assert_core_schema()$$
DROP PROCEDURE IF EXISTS sp_assert_core_schema$$
DELIMITER ;
