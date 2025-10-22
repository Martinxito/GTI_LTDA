const db = require('../../db');
const fallbackStore = require('./fallbackStore');

function isConnectionError(error) {
  if (!error) {
    return false;
  }

  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ECONNRESET') {
    return true;
  }

  if (error.errors && Array.isArray(error.errors)) {
    return error.errors.some((nestedError) => isConnectionError(nestedError));
  }

  return false;
}

async function insertUser({ nombre, usuario, password, rol }) {
  try {
    const [rows] = await db.query(
      `INSERT INTO usuarios (nombre, usuario, password, rol)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, usuario, rol, activo`,
      [nombre, usuario, password, rol]
    );
    return rows[0];
  } catch (error) {
    if (isConnectionError(error)) {
      console.warn('[identity.repository] Base de datos no disponible, usando almacenamiento en memoria');
      return fallbackStore.insertUser({ nombre, usuario, password, rol });
    }
    throw error;
  }
}

async function findByUsuario(usuario) {
  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE usuario = $1', [usuario]);
    return rows[0] || null;
  } catch (error) {
    if (isConnectionError(error)) {
      return fallbackStore.findByUsuario(usuario);
    }
    throw error;
  }
}

async function findAllUsers() {
  try {
    const [rows] = await db.query(
      'SELECT id, nombre, apellido, email, telefono, direccion, usuario, rol, activo FROM usuarios'
    );
    return rows;
  } catch (error) {
    if (isConnectionError(error)) {
      return fallbackStore.findAllUsers();
    }
    throw error;
  }
}

module.exports = {
  insertUser,
  findByUsuario,
  findAllUsers
};
