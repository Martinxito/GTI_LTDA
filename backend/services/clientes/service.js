const { ServiceError } = require('../utils/serviceError');
const { hashPassword } = require('../shared/security');
const repository = require('./repository');

async function listClients() {
  return repository.listClients();
}

async function getClient(id) {
  const client = await repository.findClientById(id);
  if (!client) {
    throw new ServiceError('Cliente no encontrado', { status: 404 });
  }
  return client;
}

async function createClient(payload) {
  const {
    nombre,
    apellido,
    email,
    telefono,
    direccion,
    fecha_nacimiento,
    documento_identidad,
    tipo_documento,
    password
  } = payload;

  if (!nombre || !email || !telefono || !documento_identidad || !password) {
    throw new ServiceError('Faltan datos obligatorios para crear el cliente', { status: 400 });
  }

  const hashedPassword = await hashPassword(password);
  const data = {
    nombre,
    apellido,
    email,
    telefono,
    direccion,
    fecha_nacimiento,
    documento_identidad,
    tipo_documento: tipo_documento || 'CC',
    usuario: payload.usuario || email,
    password: hashedPassword
  };

  try {
    const record = await repository.insertClient(data);
    return {
      id: record.id,
      mensaje: 'Cliente creado exitosamente'
    };
  } catch (error) {
    if (error.code === '23505') {
      throw new ServiceError('El email o documento ya está registrado', { status: 409 });
    }
    throw new ServiceError('No fue posible crear el cliente', { status: 500, details: error.message });
  }
}

async function updateClient(id, payload) {
  await getClient(id);

  const data = {
    nombre: payload.nombre,
    apellido: payload.apellido,
    email: payload.email,
    telefono: payload.telefono,
    direccion: payload.direccion,
    fecha_nacimiento: payload.fecha_nacimiento,
    documento_identidad: payload.documento_identidad,
    tipo_documento: payload.tipo_documento || 'CC'
  };

  try {
    await repository.updateClient(id, data);
    return { mensaje: 'Cliente actualizado exitosamente' };
  } catch (error) {
    if (error.code === '23505') {
      throw new ServiceError('El email o documento ya está registrado', { status: 409 });
    }
    throw new ServiceError('No fue posible actualizar el cliente', { status: 500, details: error.message });
  }
}

async function deleteClient(id) {
  await getClient(id);
  await repository.deactivateClient(id);
  return { mensaje: 'Cliente eliminado exitosamente' };
}

module.exports = {
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient
};
