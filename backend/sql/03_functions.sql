-- Funciones utilitarias ABD (MySQL 8).

-- fn_precio_vigente: obtiene el precio activo para una fecha dada.
DROP FUNCTION IF EXISTS fn_precio_vigente;
DELIMITER $$
CREATE FUNCTION fn_precio_vigente(p_producto_id INT, p_fecha DATE)
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE v_precio DECIMAL(10,2);
  SELECT hp.precio_unitario
    INTO v_precio
    FROM historial_precios hp
   WHERE hp.producto_id = p_producto_id
     AND hp.fecha_inicio <= p_fecha
     AND (hp.fecha_fin IS NULL OR p_fecha < hp.fecha_fin)
   ORDER BY hp.fecha_inicio DESC
   LIMIT 1;
  RETURN v_precio;
END$$
DELIMITER ;

-- fn_kpi_ingresos_mes: suma de facturacion por ano/mes.
DROP FUNCTION IF EXISTS fn_kpi_ingresos_mes;
DELIMITER $$
CREATE FUNCTION fn_kpi_ingresos_mes(p_anio INT, p_mes INT)
RETURNS DECIMAL(12,2)
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE v_total DECIMAL(12,2);
  SELECT COALESCE(SUM(f.monto_total), 0)
    INTO v_total
    FROM facturas f
   WHERE YEAR(f.fecha_factura) = p_anio
     AND MONTH(f.fecha_factura) = p_mes;
  RETURN v_total;
END$$
DELIMITER ;

-- fn_normalizar_placa: limpia la placa para comparaciones (trim, upper, colapsa guiones).
DROP FUNCTION IF EXISTS fn_normalizar_placa;
DELIMITER $$
CREATE FUNCTION fn_normalizar_placa(p_placa VARCHAR(20))
RETURNS VARCHAR(20)
DETERMINISTIC
BEGIN
  DECLARE v_result VARCHAR(20);
  SET v_result = UPPER(REPLACE(TRIM(p_placa), ' ', ''));
  SET v_result = REGEXP_REPLACE(v_result, '-+', '-');
  RETURN v_result;
END$$
DELIMITER ;
