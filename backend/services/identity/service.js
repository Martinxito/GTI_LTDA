const { ServiceError } = require('../utils/serviceError');
const { hashPassword, verifyPassword, generateToken } = require('../shared/security');
const repository = require('./repository');

const DUPLICATE_ERROR_CODES = new Set(['23505', 'DUPLICATE_USER', 'DUPLICATE_EMAIL']);

function generateTemporaryPassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@$!%*?&';
  const length = 12;
  let password = '';
  for (let i = 0; i < length; i += 1) {
    const index = Math.floor(Math.random() * alphabet.length);
    password += alphabet[index];
  }
  return password;
}

function normalizeUsername(payload) {
  if (payload.usuario && payload.usuario.trim()) {
    return payload.usuario.trim();
  }
  if (payload.email && payload.email.trim()) {
    return payload.email.trim().toLowerCase();
  }
  return null;
}

async function registerUser(payload) {
  const { nombre, usuario, password, rol } = payload;

  if (!nombre || !usuario || !password || !rol) {
    throw new ServiceError('Faltan datos obligatorios para registrar el usuario', {
      status: 400
    });
  }

  const existingUser = await repository.findByUsuario(usuario);
  if (existingUser) {
    throw new ServiceError('El usuario ya está registrado', { status: 409 });
  }

  const hashedPassword = await hashPassword(password);

  try {
    const user = await repository.insertUser({
      nombre,
      usuario,
      password: hashedPassword,
      rol
    });
    return { id: user.id, mensaje: 'Usuario registrado' };
  } catch (error) {
    throw new ServiceError('No fue posible registrar el usuario', { status: 500, details: error.message });
  }
}

async function createUser(payload) {
  const { nombre, apellido, email, telefono, direccion, rol, password } = payload;

  if (!nombre || !email) {
    throw new ServiceError('Nombre y email son obligatorios para crear el usuario', { status: 400 });
  }

  const normalizedUsuario = normalizeUsername(payload);
  if (!normalizedUsuario) {
    throw new ServiceError('Debe especificar un usuario o un email válido', { status: 400 });
  }

  const finalRol = rol || 'cliente';
  const plainPassword = password || generateTemporaryPassword();
  const hashedPassword = await hashPassword(plainPassword);

  const userData = {
    nombre,
    apellido,
    email,
    telefono,
    direccion,
    usuario: normalizedUsuario,
    password: hashedPassword,
    rol: finalRol,
    activo: payload.activo ?? true
  };

  try {
    const user = await repository.insertManagedUser(userData);
    const response = {
      ...user,
      mensaje: 'Usuario creado correctamente'
    };
    if (!password) {
      response.passwordTemporal = plainPassword;
    }
    return response;
  } catch (error) {
    if (DUPLICATE_ERROR_CODES.has(error.code)) {
      throw new ServiceError('El usuario o email ya está registrado', { status: 409 });
    }
    throw new ServiceError('No fue posible crear el usuario', { status: 500, details: error.message });
  }
}

async function authenticateUser(credentials) {
  const { usuario, password } = credentials;

  if (!usuario || !password) {
    throw new ServiceError('Usuario y contraseña son obligatorios', { status: 400 });
  }

  const user = await repository.findByUsuario(usuario);
  if (!user) {
    throw new ServiceError('Usuario o contraseña incorrectos', { status: 401 });
  }

  const isValidPassword = await verifyPassword(password, user.password);
  if (!isValidPassword) {
    throw new ServiceError('Usuario o contraseña incorrectos', { status: 401 });
  }

  const token = generateToken({
    id: user.id,
    nombre: user.nombre,
    usuario: user.usuario,
    rol: user.rol
  });

  const { password: _ignored, ...safeUser } = user;

  return { user: safeUser, token };
}

async function getAllUsers() {
  return await repository.findAllUsers();
}

async function getUserById(id) {
  const user = await repository.findById(id);
  if (!user) {
    throw new ServiceError('Usuario no encontrado', { status: 404 });
  }
  return user;
}

async function updateUser(id, payload) {
  await getUserById(id);

  const updates = {};
  for (const field of ['nombre', 'apellido', 'email', 'telefono', 'direccion', 'rol', 'activo']) {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      updates[field] = payload[field];
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'usuario')) {
    const normalizedUsuario = normalizeUsername(payload);
    if (!normalizedUsuario) {
      throw new ServiceError('Debe especificar un usuario o email válido', { status: 400 });
    }
    updates.usuario = normalizedUsuario;
  }

  try {
    const updated = await repository.updateUser(id, updates);

    return {
      ...updated,
      mensaje: 'Usuario actualizado correctamente'
    };
  } catch (error) {
    if (DUPLICATE_ERROR_CODES.has(error.code)) {
      throw new ServiceError('El usuario o email ya está registrado', { status: 409 });
    }
    throw new ServiceError('No fue posible actualizar el usuario', { status: 500, details: error.message });
  }
}

async function deleteUser(id) {
  await getUserById(id);
  await repository.deactivateUser(id);
  return { mensaje: 'Usuario eliminado correctamente' };
}

module.exports = {
  registerUser,
  authenticateUser,
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser
};
