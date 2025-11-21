const db = require('../../db');

async function listAppointments() {
  const [rows] = await db.query(
    `SELECT
       c.*,
       u.nombre AS usuario_nombre,
       u.apellido AS usuario_apellido,
       u.telefono AS usuario_telefono,
       v.marca AS vehiculo_marca,
       v.modelo AS vehiculo_modelo,
       v.placa AS vehiculo_placa,
       s.nombre AS servicio_nombre,
       s.precio_base AS servicio_precio,
       m.nombre AS mecanico_nombre
     FROM citas c
     LEFT JOIN usuarios u ON c.usuario_id = u.id
     LEFT JOIN vehiculos v ON c.vehiculo_id = v.id
     LEFT JOIN servicios s ON c.servicio_id = s.id
     LEFT JOIN usuarios m ON c.mecanico_id = m.id
     ORDER BY c.fecha_cita DESC, c.hora_inicio DESC`
  );
  return rows;
}

async function listAppointmentsByUser(usuarioId) {
  const [rows] = await db.query(
    `SELECT
       c.*,
       u.nombre AS usuario_nombre,
       u.apellido AS usuario_apellido,
       u.telefono AS usuario_telefono,
       v.marca AS vehiculo_marca,
       v.modelo AS vehiculo_modelo,
       v.placa AS vehiculo_placa,
       s.nombre AS servicio_nombre,
       s.precio_base AS servicio_precio,
       m.nombre AS mecanico_nombre
     FROM citas c
     LEFT JOIN usuarios u ON c.usuario_id = u.id
     LEFT JOIN vehiculos v ON c.vehiculo_id = v.id
     LEFT JOIN servicios s ON c.servicio_id = s.id
     LEFT JOIN usuarios m ON c.mecanico_id = m.id
     WHERE c.usuario_id = $1
     ORDER BY c.fecha_cita DESC, c.hora_inicio DESC`,
    [usuarioId]
  );
  return rows;
}

async function listAppointmentsByDate(fecha) {
  const [rows] = await db.query(
    `SELECT
       c.*,
       u.nombre AS usuario_nombre,
       u.apellido AS usuario_apellido,
       v.marca AS vehiculo_marca,
       v.modelo AS vehiculo_modelo,
       v.placa AS vehiculo_placa,
       s.nombre AS servicio_nombre,
       m.nombre AS mecanico_nombre
     FROM citas c
     LEFT JOIN usuarios u ON c.usuario_id = u.id
     LEFT JOIN vehiculos v ON c.vehiculo_id = v.id
     LEFT JOIN servicios s ON c.servicio_id = s.id
     LEFT JOIN usuarios m ON c.mecanico_id = m.id
     WHERE c.fecha_cita = $1
     ORDER BY c.hora_inicio`,
    [fecha]
  );
  return rows;
}

async function listAppointmentsByDateAndUser(fecha, usuarioId) {
  const [rows] = await db.query(
    `SELECT
       c.*,
       u.nombre AS usuario_nombre,
       u.apellido AS usuario_apellido,
       v.marca AS vehiculo_marca,
       v.modelo AS vehiculo_modelo,
       v.placa AS vehiculo_placa,
       s.nombre AS servicio_nombre,
       m.nombre AS mecanico_nombre
     FROM citas c
     LEFT JOIN usuarios u ON c.usuario_id = u.id
     LEFT JOIN vehiculos v ON c.vehiculo_id = v.id
     LEFT JOIN servicios s ON c.servicio_id = s.id
     LEFT JOIN usuarios m ON c.mecanico_id = m.id
     WHERE c.fecha_cita = $1 AND c.usuario_id = $2
     ORDER BY c.hora_inicio`,
    [fecha, usuarioId]
  );
  return rows;
}

async function listAppointmentsByMechanic(mecanicoId) {
  const [rows] = await db.query(
    `SELECT
       c.*,
       u.nombre AS usuario_nombre,
       u.apellido AS usuario_apellido,
       v.marca AS vehiculo_marca,
       v.modelo AS vehiculo_modelo,
       v.placa AS vehiculo_placa,
       s.nombre AS servicio_nombre
     FROM citas c
     LEFT JOIN usuarios u ON c.usuario_id = u.id
     LEFT JOIN vehiculos v ON c.vehiculo_id = v.id
     LEFT JOIN servicios s ON c.servicio_id = s.id
     WHERE c.mecanico_id = $1
     ORDER BY c.fecha_cita DESC, c.hora_inicio DESC`,
    [mecanicoId]
  );
  return rows;
}

async function findAppointmentById(id) {
  const [rows] = await db.query(
    `SELECT
       c.*,
       u.nombre AS usuario_nombre,
       u.apellido AS usuario_apellido,
       u.telefono AS usuario_telefono,
       u.email AS usuario_email,
       v.marca AS vehiculo_marca,
       v.modelo AS vehiculo_modelo,
       v.placa AS vehiculo_placa,
       v.kilometraje AS vehiculo_kilometraje,
       s.nombre AS servicio_nombre,
       s.precio_base AS servicio_precio,
       s.duracion_estimada AS servicio_duracion,
       m.nombre AS mecanico_nombre
     FROM citas c
     LEFT JOIN usuarios u ON c.usuario_id = u.id
     LEFT JOIN vehiculos v ON c.vehiculo_id = v.id
     LEFT JOIN servicios s ON c.servicio_id = s.id
     LEFT JOIN usuarios m ON c.mecanico_id = m.id
     WHERE c.id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function insertAppointment(data) {
  const [rows] = await db.query(
    `INSERT INTO citas (
       usuario_id,
       vehiculo_id,
       servicio_id,
       mecanico_id,
       fecha_cita,
       hora_inicio,
       hora_fin,
       observaciones,
       costo_total
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [
      data.usuario_id,
      data.vehiculo_id,
      data.servicio_id,
      data.mecanico_id,
      data.fecha_cita,
      data.hora_inicio,
      data.hora_fin,
      data.observaciones,
      data.costo_total
    ]
  );
  return rows[0];
}

async function updateAppointment(id, data) {
  await db.query(
    `UPDATE citas SET
       usuario_id = $1,
       vehiculo_id = $2,
       servicio_id = $3,
       mecanico_id = $4,
       fecha_cita = $5,
       hora_inicio = $6,
       hora_fin = $7,
       estado = $8,
       observaciones = $9,
       diagnostico = $10,
       costo_total = $11
     WHERE id = $12`,
    [
      data.usuario_id,
      data.vehiculo_id,
      data.servicio_id,
      data.mecanico_id,
      data.fecha_cita,
      data.hora_inicio,
      data.hora_fin,
      data.estado,
      data.observaciones,
      data.diagnostico,
      data.costo_total,
      id
    ]
  );
}

async function updateAppointmentStatus(id, estado) {
  await db.query(
    `UPDATE citas SET estado = $1 WHERE id = $2`,
    [estado, id]
  );
}

async function updateAppointmentNotes(id, observaciones) {
  await db.query(
    `UPDATE citas SET observaciones = $1 WHERE id = $2`,
    [observaciones, id]
  );
}

module.exports = {
  listAppointments,
  listAppointmentsByUser,
  listAppointmentsByDate,
  listAppointmentsByDateAndUser,
  listAppointmentsByMechanic,
  findAppointmentById,
  insertAppointment,
  updateAppointment,
  updateAppointmentStatus,
  updateAppointmentNotes
};
