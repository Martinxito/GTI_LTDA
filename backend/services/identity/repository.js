const db = require('../../db');
const fallbackStore = require('./fallbackStore');

const REQUIRED_USER_COLUMNS = [
  'id',
  'nombre',
  'apellido',
  'email',
  'telefono',
  'direccion',
  'usuario',
  'rol',
  'activo'
];

const POSTGRES_UNDEFINED_COLUMN_CODE = '42703';

let useFlexibleUserQuery = false;

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
    if (useFlexibleUserQuery) {
      const [rows] = await db.query('SELECT * FROM usuarios');
      return rows.map((row) => normalizeUserRow(row));
    }

    const [rows] = await db.query(
      `SELECT ${REQUIRED_USER_COLUMNS.join(', ')} FROM usuarios`
    );
    return rows.map((row) => normalizeUserRow(row));
  } catch (error) {
    if (isConnectionError(error)) {
      return fallbackStore.findAllUsers();
    }
    if (error.code === POSTGRES_UNDEFINED_COLUMN_CODE) {
      console.warn(
        `[identity.repository] Columna faltante en la tabla usuarios detectada (${error.message}). ` +
          'Usando consulta flexible para continuar mientras se ejecutan las migraciones.'
      );
      useFlexibleUserQuery = true;
      const [rows] = await db.query('SELECT * FROM usuarios');
      return rows.map((row) => normalizeUserRow(row));
    }
    throw error;
  }
}

function normalizeUserRow(row) {
  return REQUIRED_USER_COLUMNS.reduce((acc, column) => {
    acc[column] = Object.prototype.hasOwnProperty.call(row, column) ? row[column] : null;
    return acc;
  }, {});
}

module.exports = {
  insertUser,
  findByUsuario,
  findAllUsers
};
