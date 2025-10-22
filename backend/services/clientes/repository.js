const db = require('../../db');

async function listClients() {
  const [rows] = await db.query(
    `SELECT
       u.id,
       u.nombre,
       u.apellido,
       u.email,
       u.telefono,
       u.direccion,
       u.fecha_nacimiento,
       u.documento_identidad,
       u.tipo_documento,
       u.activo AS usuario_activo,
       COUNT(v.id) AS total_vehiculos
     FROM usuarios u
     LEFT JOIN vehiculos v ON v.cliente_id = u.id AND v.activo = true
     WHERE u.rol = 'cliente' AND u.activo = true
     GROUP BY u.id
     ORDER BY u.nombre, u.apellido`
  );
  return rows;
}

async function findClientById(id) {
  const [rows] = await db.query(
    `SELECT
       u.id,
       u.nombre,
       u.apellido,
       u.email,
       u.telefono,
       u.direccion,
       u.fecha_nacimiento,
       u.documento_identidad,
       u.tipo_documento,
       u.activo AS usuario_activo
     FROM usuarios u
     WHERE u.id = $1 AND u.rol = 'cliente'`,
    [id]
  );
  return rows[0] || null;
}

async function insertClient(data) {
  const [rows] = await db.query(
    `INSERT INTO usuarios (
       nombre,
       apellido,
       email,
       telefono,
       direccion,
       fecha_nacimiento,
       documento_identidad,
       tipo_documento,
       usuario,
       password,
       rol
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'cliente')
     RETURNING id`,
    [
      data.nombre,
      data.apellido,
      data.email,
      data.telefono,
      data.direccion,
      data.fecha_nacimiento,
      data.documento_identidad,
      data.tipo_documento,
      data.usuario,
      data.password
    ]
  );
  return rows[0];
}

async function updateClient(id, data) {
  await db.query(
    `UPDATE usuarios SET
       nombre = $1,
       apellido = $2,
       email = $3,
       telefono = $4,
       direccion = $5,
       fecha_nacimiento = $6,
       documento_identidad = $7,
       tipo_documento = $8
     WHERE id = $9 AND rol = 'cliente'`,
    [
      data.nombre,
      data.apellido,
      data.email,
      data.telefono,
      data.direccion,
      data.fecha_nacimiento,
      data.documento_identidad,
      data.tipo_documento,
      id
    ]
  );
}

async function deactivateClient(id) {
  await db.query(
    `UPDATE usuarios SET activo = false
     WHERE id = $1 AND rol = 'cliente'`,
    [id]
  );
}

module.exports = {
  listClients,
  findClientById,
  insertClient,
  updateClient,
  deactivateClient
};
