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
const POSTGRES_UNDEFINED_TABLE_CODE = '42P01';

const USER_SCHEMA_ALTER_STATEMENTS = {
  apellido: 'ADD COLUMN IF NOT EXISTS apellido VARCHAR(100)',
  email: 'ADD COLUMN IF NOT EXISTS email VARCHAR(255)',
  telefono: 'ADD COLUMN IF NOT EXISTS telefono VARCHAR(20)',
  direccion: 'ADD COLUMN IF NOT EXISTS direccion TEXT',
  activo: 'ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true'
};

let useFlexibleUserQuery = false;
let userTableHasRequiredColumns = false;
let ensureUserSchemaPromise = null;

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

async function ensureUserTableSchema() {
  if (userTableHasRequiredColumns) {
    return true;
  }

  if (!ensureUserSchemaPromise) {
    ensureUserSchemaPromise = (async () => {
      try {
        const [rows] = await db.query(`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_schema = current_schema()
            AND table_name = 'usuarios'
        `);

        const existingColumns = new Set(
          rows.map((row) => row.column_name.toLowerCase())
        );

        const missingColumns = REQUIRED_USER_COLUMNS.filter(
          (column) => !existingColumns.has(column.toLowerCase())
        );

        const alterStatements = [];
        const createdColumns = [];

        for (const column of missingColumns) {
          const statement = USER_SCHEMA_ALTER_STATEMENTS[column];
          if (statement) {
            alterStatements.push(statement);
            createdColumns.push(column.toLowerCase());
          }
        }

        if (alterStatements.length > 0) {
          await db.query(
            `
              ALTER TABLE usuarios
              ${alterStatements.join(',\n              ')}
            `
          );
          createdColumns.forEach((column) => existingColumns.add(column));
          console.info(
            `[identity.repository] Columnas agregadas automáticamente a usuarios: ${createdColumns.join(', ')}`
          );
        }

        const unresolvedColumns = missingColumns.filter(
          (column) => !USER_SCHEMA_ALTER_STATEMENTS[column]
        );
        if (unresolvedColumns.length > 0) {
          console.warn(
            `[identity.repository] Columnas faltantes que no se pueden agregar automáticamente: ${unresolvedColumns.join(', ')}`
          );
        }

        userTableHasRequiredColumns = REQUIRED_USER_COLUMNS.every((column) =>
          existingColumns.has(column.toLowerCase())
        );
        useFlexibleUserQuery = !userTableHasRequiredColumns;
        return userTableHasRequiredColumns;
      } catch (error) {
        if (error.code === POSTGRES_UNDEFINED_TABLE_CODE) {
          console.warn(
            '[identity.repository] La tabla usuarios aún no existe. Usando consulta flexible hasta que las migraciones finalicen.'
          );
        } else if (!isConnectionError(error)) {
          console.error(
            '[identity.repository] Error al verificar o ajustar el esquema de usuarios:',
            error
          );
        }
        useFlexibleUserQuery = true;
        return false;
      } finally {
        ensureUserSchemaPromise = null;
      }
    })();
  }

  return ensureUserSchemaPromise;
}

async function insertUser({ nombre, usuario, password, rol }) {
  const hasRequiredColumns = await ensureUserTableSchema();
  try {
    const returningColumns = ['id', 'nombre', 'usuario', 'rol'];
    if (hasRequiredColumns && !useFlexibleUserQuery) {
      returningColumns.push('activo');
    }

    const [rows] = await db.query(
      `INSERT INTO usuarios (nombre, usuario, password, rol)
       VALUES ($1, $2, $3, $4)
       RETURNING ${returningColumns.join(', ')}`,
      [nombre, usuario, password, rol]
    );
    const user = rows[0];
    if (user && !Object.prototype.hasOwnProperty.call(user, 'activo')) {
      user.activo = true;
    }
    return user;
  } catch (error) {
    if (isConnectionError(error)) {
      console.warn('[identity.repository] Base de datos no disponible, usando almacenamiento en memoria');
      return fallbackStore.insertUser({ nombre, usuario, password, rol });
    }
    if (error.code === POSTGRES_UNDEFINED_COLUMN_CODE || error.code === POSTGRES_UNDEFINED_TABLE_CODE) {
      useFlexibleUserQuery = true;
      userTableHasRequiredColumns = false;
      console.warn(
        '[identity.repository] Esquema de usuarios incompleto detectado al insertar. Usando almacenamiento temporal.'
      );
      return fallbackStore.insertUser({ nombre, usuario, password, rol });
    }
    throw error;
  }
}

async function insertManagedUser(userData) {
  const hasRequiredColumns = await ensureUserTableSchema();
  const values = [
    userData.nombre,
    userData.apellido || null,
    userData.email || null,
    userData.telefono || null,
    userData.direccion || null,
    userData.usuario,
    userData.password,
    userData.rol,
    userData.activo ?? true
  ];

  const returningColumns = (hasRequiredColumns && !useFlexibleUserQuery)
    ? REQUIRED_USER_COLUMNS.join(', ')
    : '*';

  try {
    const [rows] = await db.query(
      `INSERT INTO usuarios (nombre, apellido, email, telefono, direccion, usuario, password, rol, activo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING ${returningColumns}`,
      values
    );

    return normalizeUserRow(rows[0]);
  } catch (error) {
    if (isConnectionError(error)) {
      console.warn('[identity.repository] Base de datos no disponible, usando almacenamiento en memoria');
      return fallbackStore.insertUser(userData);
    }
    if (error.code === POSTGRES_UNDEFINED_COLUMN_CODE || error.code === POSTGRES_UNDEFINED_TABLE_CODE) {
      useFlexibleUserQuery = true;
      userTableHasRequiredColumns = false;
      console.warn('[identity.repository] Esquema de usuarios incompleto detectado al crear usuario gestionado. Usando almacenamiento temporal.');
      return fallbackStore.insertUser(userData);
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
    if (error.code === POSTGRES_UNDEFINED_TABLE_CODE) {
      console.warn('[identity.repository] Tabla usuarios no disponible. Usando almacenamiento temporal para la consulta.');
      return fallbackStore.findByUsuario(usuario);
    }
    throw error;
  }
}

async function findById(id) {
  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    const user = rows[0];
    return user ? normalizeUserRow(user) : null;
  } catch (error) {
    if (isConnectionError(error)) {
      return fallbackStore.findById(id);
    }
    if (error.code === POSTGRES_UNDEFINED_TABLE_CODE) {
      console.warn('[identity.repository] Tabla usuarios no disponible. Usando almacenamiento temporal para findById.');
      return fallbackStore.findById(id);
    }
    throw error;
  }
}

async function updateUser(id, updates) {
  const hasRequiredColumns = await ensureUserTableSchema();

  const allowedFields = ['nombre', 'apellido', 'email', 'telefono', 'direccion', 'usuario', 'rol', 'activo'];
  const setStatements = [];
  const values = [];
  let index = 1;

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(updates, field)) {
      setStatements.push(`${field} = $${index++}`);
      values.push(updates[field]);
    }
  }

  if (setStatements.length === 0) {
    return findById(id);
  }

  const returningColumns = (hasRequiredColumns && !useFlexibleUserQuery)
    ? REQUIRED_USER_COLUMNS.join(', ')
    : '*';

  const query = `
    UPDATE usuarios
    SET ${setStatements.join(', ')}
    WHERE id = $${index}
    RETURNING ${returningColumns}
  `;

  values.push(id);

  try {
    const [rows] = await db.query(query, values);
    const user = rows[0];
    return user ? normalizeUserRow(user) : null;
  } catch (error) {
    if (isConnectionError(error)) {
      const fallbackResult = fallbackStore.updateUser(id, updates);
      return fallbackResult;
    }
    if (error.code === POSTGRES_UNDEFINED_TABLE_CODE) {
      console.warn('[identity.repository] Tabla usuarios no disponible. Usando almacenamiento temporal para updateUser.');
      return fallbackStore.updateUser(id, updates);
    }
    if (error.code === POSTGRES_UNDEFINED_COLUMN_CODE) {
      console.warn('[identity.repository] Columna faltante al actualizar usuario. Usando almacenamiento temporal para updateUser.');
      useFlexibleUserQuery = true;
      userTableHasRequiredColumns = false;
      return fallbackStore.updateUser(id, updates);
    }
    throw error;
  }
}

async function deactivateUser(id) {
  const result = await updateUser(id, { activo: false });
  return result;
}

async function findAllUsers() {
  try {
    const hasRequiredColumns = await ensureUserTableSchema();

    if (useFlexibleUserQuery || !hasRequiredColumns) {
      const [rows] = await db.query('SELECT * FROM usuarios');
      return rows
        .map((row) => normalizeUserRow(row))
        .filter((user) => user.activo !== false);
    }

    const [rows] = await db.query(
      `SELECT ${REQUIRED_USER_COLUMNS.join(', ')} FROM usuarios`
    );
    return rows
      .map((row) => normalizeUserRow(row))
      .filter((user) => user.activo !== false);
  } catch (error) {
    if (isConnectionError(error)) {
      return fallbackStore.findAllUsers();
    }
    if (error.code === POSTGRES_UNDEFINED_TABLE_CODE) {
      console.warn('[identity.repository] Tabla usuarios no disponible. Usando almacenamiento temporal.');
      return fallbackStore.findAllUsers();
    }
    if (error.code === POSTGRES_UNDEFINED_COLUMN_CODE) {
      console.warn(
        `[identity.repository] Columna faltante en la tabla usuarios detectada (${error.message}). ` +
          'Usando consulta flexible para continuar mientras se ejecutan las migraciones.'
      );
      useFlexibleUserQuery = true;
      userTableHasRequiredColumns = false;
      const [rows] = await db.query('SELECT * FROM usuarios');
      return rows
        .map((row) => normalizeUserRow(row))
        .filter((user) => user.activo !== false);
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
  insertManagedUser,
  findByUsuario,
  findById,
  updateUser,
  deactivateUser,
  findAllUsers
};
