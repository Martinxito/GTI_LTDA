const db = require('../../db');

async function listVehicles() {
  const [rows] = await db.query(
    `SELECT
       v.id,
       v.cliente_id,
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
       u.nombre AS cliente_nombre,
       u.apellido AS cliente_apellido,
       u.telefono AS cliente_telefono
     FROM vehiculos v
     JOIN usuarios u ON v.cliente_id = u.id
     WHERE v.activo = true
     ORDER BY v.created_at DESC`
  );
  return rows;
}

async function findVehicleById(id) {
  const [rows] = await db.query(
    `SELECT
       v.*,
       u.nombre AS cliente_nombre,
       u.apellido AS cliente_apellido,
       u.telefono AS cliente_telefono,
       u.email AS cliente_email
     FROM vehiculos v
     JOIN usuarios u ON v.cliente_id = u.id
     WHERE v.id = $1 AND v.activo = true`,
    [id]
  );
  return rows[0] || null;
}

async function findVehiclesByClient(clienteId) {
  const [rows] = await db.query(
    `SELECT *
     FROM vehiculos
     WHERE cliente_id = $1 AND activo = true
     ORDER BY created_at DESC`,
    [clienteId]
  );
  return rows;
}

async function insertVehicle(data) {
  const [rows] = await db.query(
    `INSERT INTO vehiculos (
       cliente_id,
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
      data.cliente_id,
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
  await db.query(
    `UPDATE vehiculos SET
      cliente_id = $1,
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
      data.cliente_id,
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
}

async function deactivateVehicle(id) {
  await db.query('UPDATE vehiculos SET activo = false WHERE id = $1', [id]);
}

module.exports = {
  listVehicles,
  findVehicleById,
  findVehiclesByClient,
  insertVehicle,
  updateVehicle,
  deactivateVehicle
};
