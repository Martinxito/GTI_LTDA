const db = require('../../db');

const CLIENT_COLUMN_MAP = {
  id: ['id'],
  nombre: ['nombre', 'u_nombre'],
  apellido: ['apellido', 'u_apellido'],
  email: ['email', 'u_email'],
  telefono: ['telefono', 'u_telefono'],
  direccion: ['direccion', 'u_direccion'],
  fecha_nacimiento: ['fecha_nacimiento', 'u_fecha_nacimiento'],
  documento_identidad: ['documento_identidad', 'u_documento_identidad'],
  tipo_documento: ['tipo_documento', 'u_tipo_documento'],
  usuario_activo: ['activo', 'u_activo']
};

async function resolveClientColumns() {
  const [rows] = await db.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = current_schema()
       AND table_name = 'usuarios'`
  );

  const existingColumns = new Set(rows.map((row) => row.column_name.toLowerCase()));

  const selectColumns = Object.entries(CLIENT_COLUMN_MAP)
    .map(([alias, candidates]) => {
      const match = candidates.find((column) => existingColumns.has(column.toLowerCase()));
      return match ? `u.${match} AS ${alias}` : null;
    })
    .filter(Boolean);

  // Siempre incluimos el id para evitar consultas inválidas
  if (!selectColumns.length) {
    selectColumns.push('u.id');
  }

  return selectColumns.join(',\n       ');
}

async function listClients() {
  const clientColumns = await resolveClientColumns();
  const [rows] = await db.query(
    `SELECT
       ${clientColumns},
       COUNT(v.id) AS total_vehiculos
     FROM usuarios u
     LEFT JOIN vehiculos v ON v.cliente_id = u.id AND v.activo = true
     WHERE LOWER(u.rol) = 'cliente' AND u.activo = true
     GROUP BY u.id
     ORDER BY u.nombre, u.apellido`
  );
  return rows;
}

async function findClientById(id) {
  const clientColumns = await resolveClientColumns();
  const [rows] = await db.query(
    `SELECT
       ${clientColumns}
     FROM usuarios u
     WHERE u.id = $1 AND LOWER(u.rol) = 'cliente'`,
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
