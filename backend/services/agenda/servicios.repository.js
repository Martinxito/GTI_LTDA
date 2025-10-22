const db = require('../../db');

async function listServices() {
  const [rows] = await db.query(
    `SELECT * FROM servicios WHERE activo = true ORDER BY categoria, nombre`
  );
  return rows;
}

async function listServicesByCategory(categoria) {
  const [rows] = await db.query(
    `SELECT * FROM servicios WHERE categoria = $1 AND activo = true ORDER BY nombre`,
    [categoria]
  );
  return rows;
}

async function findServiceById(id) {
  const [rows] = await db.query(
    'SELECT * FROM servicios WHERE id = $1 AND activo = true',
    [id]
  );
  return rows[0] || null;
}

async function insertService(data) {
  const [rows] = await db.query(
    `INSERT INTO servicios (nombre, descripcion, precio_base, duracion_estimada, categoria)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [
      data.nombre,
      data.descripcion,
      data.precio_base,
      data.duracion_estimada,
      data.categoria
    ]
  );
  return rows[0];
}

async function updateService(id, data) {
  await db.query(
    `UPDATE servicios SET
       nombre = $1,
       descripcion = $2,
       precio_base = $3,
       duracion_estimada = $4,
       categoria = $5
     WHERE id = $6 AND activo = true`,
    [
      data.nombre,
      data.descripcion,
      data.precio_base,
      data.duracion_estimada,
      data.categoria,
      id
    ]
  );
}

async function deactivateService(id) {
  await db.query('UPDATE servicios SET activo = false WHERE id = $1', [id]);
}

async function listCategories() {
  const [rows] = await db.query(
    `SELECT DISTINCT categoria FROM servicios WHERE activo = true AND categoria IS NOT NULL ORDER BY categoria`
  );
  return rows.map((row) => row.categoria);
}

module.exports = {
  listServices,
  listServicesByCategory,
  findServiceById,
  insertService,
  updateService,
  deactivateService,
  listCategories
};
