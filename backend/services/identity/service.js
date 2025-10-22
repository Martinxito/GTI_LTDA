const { ServiceError } = require('../utils/serviceError');
const { hashPassword, verifyPassword, generateToken } = require('../shared/security');
const repository = require('./repository');

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

module.exports = {
  registerUser,
  authenticateUser
};
