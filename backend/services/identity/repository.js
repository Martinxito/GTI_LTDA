const db = require('../../db');

async function insertUser({ nombre, usuario, password, rol }) {
  const [rows] = await db.query(
    `INSERT INTO usuarios (nombre, usuario, password, rol)
     VALUES ($1, $2, $3, $4)
     RETURNING id, nombre, usuario, rol, activo`,
    [nombre, usuario, password, rol]
  );
  return rows[0];
}

async function findByUsuario(usuario) {
  const [rows] = await db.query('SELECT * FROM usuarios WHERE usuario = $1', [usuario]);
  return rows[0] || null;
}

async function findAllUsers() {
  const [rows] = await db.query(
    'SELECT id, nombre, apellido, email, telefono, direccion, usuario, rol, activo FROM usuarios'
  );
  return rows;
}

module.exports = {
  insertUser,
  findByUsuario,
  findAllUsers
};
