const bcrypt = require('bcryptjs');

const fallbackUsers = [];
let nextId = 1;

function cloneUser(user) {
  return JSON.parse(JSON.stringify(user));
}

function sanitizeUser(user) {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

function normalizeUserPayload(payload) {
  return {
    nombre: payload.nombre || '',
    apellido: payload.apellido || '',
    email: payload.email || '',
    telefono: payload.telefono || '',
    direccion: payload.direccion || '',
    usuario: payload.usuario,
    password: payload.password,
    rol: payload.rol || 'cliente',
    activo: payload.activo ?? true
  };
}

function ensureUnique(usuario, email) {
  const lowerUsuario = usuario.toLowerCase();
  if (fallbackUsers.some((user) => user.usuario.toLowerCase() === lowerUsuario)) {
    const error = new Error('El usuario ya está registrado');
    error.code = 'DUPLICATE_USER';
    throw error;
  }

  if (email && fallbackUsers.some((user) => user.email && user.email.toLowerCase() === email.toLowerCase())) {
    const error = new Error('El email ya está registrado');
    error.code = 'DUPLICATE_EMAIL';
    throw error;
  }
}

function insertUser(payload) {
  const normalized = normalizeUserPayload(payload);

  if (!normalized.usuario) {
    throw new Error('El campo usuario es obligatorio');
  }

  ensureUnique(normalized.usuario, normalized.email);

  const newUser = {
    id: nextId++,
    ...normalized
  };

  fallbackUsers.push(newUser);
  return sanitizeUser(newUser);
}

function findByUsuario(usuario) {
  if (!usuario) {
    return null;
  }
  const lowerUsuario = usuario.toLowerCase();
  const user = fallbackUsers.find((u) => u.usuario.toLowerCase() === lowerUsuario);
  return user ? cloneUser(user) : null;
}

function findAllUsers() {
  return fallbackUsers.map((user) => sanitizeUser(user));
}

function seedDefaultUsers() {
  if (fallbackUsers.length > 0) {
    return;
  }

  const defaultPassword = bcrypt.hashSync('admin123', 10);
  insertUser({
    nombre: 'Administrador',
    apellido: 'Principal',
    email: 'admin@gti-ltda.local',
    telefono: '3000000000',
    direccion: 'Sede principal',
    usuario: 'admin',
    password: defaultPassword,
    rol: 'jefe_taller'
  });
}

seedDefaultUsers();

module.exports = {
  insertUser,
  findByUsuario,
  findAllUsers
};
