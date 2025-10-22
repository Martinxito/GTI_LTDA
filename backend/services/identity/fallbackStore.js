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

function ensureUnique(usuario, email, { ignoreUserId = null } = {}) {
  const lowerUsuario = usuario.toLowerCase();
  if (fallbackUsers.some((user) => user.id !== ignoreUserId && user.usuario.toLowerCase() === lowerUsuario)) {
    const error = new Error('El usuario ya está registrado');
    error.code = 'DUPLICATE_USER';
    throw error;
  }

  if (email && fallbackUsers.some((user) => user.id !== ignoreUserId && user.email && user.email.toLowerCase() === email.toLowerCase())) {
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

function findById(id) {
  const numericId = Number(id);
  const user = fallbackUsers.find((u) => u.id === numericId);
  return user ? cloneUser(user) : null;
}

function updateUser(id, payload) {
  const numericId = Number(id);
  const index = fallbackUsers.findIndex((u) => u.id === numericId);
  if (index === -1) {
    return null;
  }

  const current = fallbackUsers[index];
  const updatedUser = {
    ...current,
    ...payload
  };

  ensureUnique(updatedUser.usuario, updatedUser.email, { ignoreUserId: numericId });

  fallbackUsers[index] = updatedUser;
  return sanitizeUser(updatedUser);
}

function deactivateUser(id) {
  const numericId = Number(id);
  const user = fallbackUsers.find((u) => u.id === numericId);
  if (!user) {
    return null;
  }

  user.activo = false;
  return sanitizeUser(user);
}

function findAllUsers() {
  return fallbackUsers
    .filter((user) => user.activo !== false)
    .map((user) => sanitizeUser(user));
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
  findById,
  updateUser,
  deactivateUser,
  findAllUsers
};
