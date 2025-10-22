const db = require('../../db');

async function listHistoryByVehicle(vehiculoId) {
  const [rows] = await db.query(
    `SELECT
       h.id,
       h.vehiculo_id,
       h.cita_id,
       h.tipo_mantenimiento,
       h.descripcion,
       h.kilometraje_actual,
       h.proximo_mantenimiento_km,
       h.proximo_mantenimiento_fecha,
       h.created_at,
       s.nombre AS servicio_nombre,
       u.nombre AS mecanico_nombre
     FROM historial_mantenimiento h
     LEFT JOIN citas c ON h.cita_id = c.id
     LEFT JOIN servicios s ON c.servicio_id = s.id
     LEFT JOIN usuarios u ON c.mecanico_id = u.id
     WHERE h.vehiculo_id = $1
     ORDER BY h.created_at DESC`,
    [vehiculoId]
  );
  return rows;
}

async function insertHistoryEntry(data) {
  const [rows] = await db.query(
    `INSERT INTO historial_mantenimiento (
       vehiculo_id,
       cita_id,
       tipo_mantenimiento,
       descripcion,
       kilometraje_actual,
       proximo_mantenimiento_km,
       proximo_mantenimiento_fecha
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      data.vehiculo_id,
      data.cita_id,
      data.tipo_mantenimiento,
      data.descripcion,
      data.kilometraje_actual,
      data.proximo_mantenimiento_km,
      data.proximo_mantenimiento_fecha
    ]
  );
  return rows[0];
}

module.exports = {
  listHistoryByVehicle,
  insertHistoryEntry
};
