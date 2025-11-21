const db = require('../../db');

async function listVehicles() {
  const [rows] = await db.query(
    `SELECT
       v.id,
       v.usuario_id,
       v.marca,
       v.modelo,
       v.año,
       v.placa,
       v.color,
       v.kilometraje,
       v.tipo_combustible,
       v.numero_motor,
       v.numero_chasis,
       v.observaciones,
       v.created_at,
       u.nombre AS usuario_nombre,
       u.apellido AS usuario_apellido,
       u.telefono AS usuario_telefono
     FROM vehiculos v
     JOIN usuarios u ON v.usuario_id = u.id
     WHERE v.activo = true
     ORDER BY v.created_at DESC`
  );
  return rows;
}

async function findVehicleById(id) {
  const [rows] = await db.query(
    `SELECT
       v.*,
       u.nombre AS usuario_nombre,
       u.apellido AS usuario_apellido,
       u.telefono AS usuario_telefono,
       u.email AS usuario_email
     FROM vehiculos v
     JOIN usuarios u ON v.usuario_id = u.id
     WHERE v.id = $1 AND v.activo = true`,
    [id]
  );
  return rows[0] || null;
}

async function findVehiclesByUser(usuarioId) {
  const [rows] = await db.query(
    `SELECT *
     FROM vehiculos
     WHERE usuario_id = $1 AND activo = true
     ORDER BY created_at DESC`,
    [usuarioId]
  );
  return rows;
}

async function userExists(usuarioId) {
  const [rows] = await db.query(
    'SELECT 1 FROM usuarios WHERE id = $1 LIMIT 1',
    [usuarioId]
  );

  return rows.length > 0;
}

async function insertVehicle(data) {
  const [rows] = await db.query(
    `INSERT INTO vehiculos (
       usuario_id,
       marca,
       modelo,
       año,
       placa,
       color,
       kilometraje,
       tipo_combustible,
       numero_motor,
       numero_chasis,
       observaciones
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING id`,
    [
      data.usuario_id,
      data.marca,
      data.modelo,
      data.año,
      data.placa,
      data.color,
      data.kilometraje,
      data.tipo_combustible,
      data.numero_motor,
      data.numero_chasis,
      data.observaciones
    ]
  );
  return rows[0];
}

async function updateVehicle(id, data) {
  const [, result] = await db.query(
    `UPDATE vehiculos SET
      usuario_id = $1,
      marca = $2,
      modelo = $3,
      año = $4,
      placa = $5,
      color = $6,
      kilometraje = $7,
      tipo_combustible = $8,
      numero_motor = $9,
      numero_chasis = $10,
      observaciones = $11
    WHERE id = $12 AND activo = true`,
    [
      data.usuario_id,
      data.marca,
      data.modelo,
      data.año,
      data.placa,
      data.color,
      data.kilometraje,
      data.tipo_combustible,
      data.numero_motor,
      data.numero_chasis,
      data.observaciones,
      id
    ]
  );

  return result.rowCount;
}

async function deactivateVehicle(id) {
  await db.query('UPDATE vehiculos SET activo = false WHERE id = $1', [id]);
}

module.exports = {
  listVehicles,
  findVehicleById,
  findVehiclesByUser,
  userExists,
  insertVehicle,
  updateVehicle,
  deactivateVehicle
};
