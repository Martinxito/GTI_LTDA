const { ServiceError } = require('../utils/serviceError');
const repository = require('./repository');
const usuariosRepository = require('../identity/repository');
const historialService = require('../historial/service');

function assertClientOwnership(vehicle, user) {
  if (user?.rol === 'cliente' && Number(vehicle.usuario_id) !== Number(user.id)) {
    throw new ServiceError('No autorizado para acceder a este vehículo', { status: 403 });
  }
}

async function listVehicles(user) {
  if (user?.rol === 'cliente') {
    return repository.findVehiclesByUser(user.id);
  }

  return repository.listVehicles();
}

async function getVehicle(id, user) {
  const vehicle = await repository.findVehicleById(id);
  if (!vehicle) {
    throw new ServiceError('Vehículo no encontrado', { status: 404 });
  }

  assertClientOwnership(vehicle, user);

  return vehicle;
}

async function listVehiclesByUser(usuarioId, user) {
  if (user?.rol === 'cliente' && Number(usuarioId) !== Number(user.id)) {
    throw new ServiceError('No autorizado para consultar vehículos de otros usuarios', { status: 403 });
  }

  return repository.findVehiclesByUser(usuarioId);
}

async function createVehicle(payload, user) {
  const {
    usuario_id,
    marca,
    modelo,
    año,
    placa,
    color,
    kilometraje,
    tipo_combustible,
    numero_motor,
    numero_chasis,
    observaciones
  } = payload;

  const ownerId = Number(usuario_id);

  if (!ownerId || !marca || !modelo || !año || !placa) {
    throw new ServiceError('Faltan datos obligatorios para registrar el vehículo', { status: 400 });
  }

  if (user?.rol === 'cliente' && ownerId !== Number(user.id)) {
    throw new ServiceError('No autorizado para registrar vehículos a otros usuarios', { status: 403 });
  }

  if (!Number.isInteger(ownerId) || ownerId <= 0) {
    throw new ServiceError('Debe seleccionar un propietario válido', { status: 400 });
  }

  const owner = await usuariosRepository.findById(ownerId);

  if (!owner) {
    throw new ServiceError('El propietario seleccionado no existe', { status: 400 });
  }

  if (owner.activo === false) {
    throw new ServiceError('El propietario seleccionado no existe o no está activo', { status: 400 });
  }

  const data = {
    usuario_id: ownerId,
    marca,
    modelo,
    año,
    placa,
    color,
    kilometraje: kilometraje || 0,
    tipo_combustible: tipo_combustible || 'Gasolina',
    numero_motor,
    numero_chasis,
    observaciones
  };

  try {
    const record = await repository.insertVehicle(data);
    return {
      id: record.id,
      mensaje: 'Vehículo creado exitosamente'
    };
  } catch (error) {
    if (error.code === '23505') {
      throw new ServiceError('La placa ya está registrada', { status: 409 });
    }
    if (error.code === '23503') {
      throw new ServiceError('El propietario seleccionado no existe', { status: 400 });
    }
    throw new ServiceError('No fue posible registrar el vehículo', { status: 500, details: error.message });
  }
}

async function updateVehicle(id, payload, user) {
  const existingVehicle = await getVehicle(id, user);

  const resolveField = (field) => {
    const value = payload[field];
    if (value === undefined || value === null || value === '') {
      return existingVehicle[field];
    }
    return value;
  };

  const parseInteger = (value, fallback) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return fallback;
    }
    return parsed;
  };

  const data = {
    usuario_id: resolveField('usuario_id'),
    marca: resolveField('marca'),
    modelo: resolveField('modelo'),
    año: resolveField('año'),
    placa: resolveField('placa'),
    color: resolveField('color'),
    kilometraje: resolveField('kilometraje'),
    tipo_combustible: resolveField('tipo_combustible'),
    numero_motor: resolveField('numero_motor'),
    numero_chasis: resolveField('numero_chasis'),
    observaciones: resolveField('observaciones')
  };

  data.usuario_id = parseInteger(data.usuario_id, existingVehicle.usuario_id);
  data.año = parseInteger(data.año, existingVehicle.año);
  data.kilometraje = parseInteger(data.kilometraje, existingVehicle.kilometraje ?? 0);

  if (!Number.isInteger(data.usuario_id) || !Number.isInteger(data.año) || !Number.isFinite(data.kilometraje)) {
    throw new ServiceError('Datos numéricos inválidos para actualizar el vehículo', { status: 400 });
  }

  if (data.usuario_id <= 0) {
    throw new ServiceError('Debe seleccionar un propietario válido', { status: 400 });
  }

  const owner = await usuariosRepository.findById(data.usuario_id);

  if (!owner) {
    throw new ServiceError('El propietario seleccionado no existe', { status: 400 });
  }

  if (owner.activo === false) {
    throw new ServiceError('El propietario seleccionado no existe o no está activo', { status: 400 });
  }

  if (!data.usuario_id || !data.marca || !data.modelo || !data.año || !data.placa) {
    throw new ServiceError('Faltan datos obligatorios para actualizar el vehículo', { status: 400 });
  }

  try {
    const updatedRows = await repository.updateVehicle(id, data);

    if (!updatedRows) {
      throw new ServiceError('Vehículo no encontrado o inactivo', { status: 404 });
    }

    return { mensaje: 'Vehículo actualizado exitosamente' };
  } catch (error) {
    if (error.code === '23505') {
      throw new ServiceError('La placa ya está registrada', { status: 409 });
    }
    if (error.code === '23503') {
      throw new ServiceError('El propietario seleccionado no existe', { status: 400 });
    }
    throw new ServiceError('No fue posible actualizar el vehículo', { status: 500, details: error.message });
  }
}

async function deleteVehicle(id, user) {
  await getVehicle(id, user);
  await repository.deactivateVehicle(id);
  return { mensaje: 'Vehículo eliminado exitosamente' };
}

async function getVehicleHistory(id, user) {
  const vehicle = await getVehicle(id, user);
  assertClientOwnership(vehicle, user);
  return historialService.listHistoryByVehicle(id);
}

module.exports = {
  listVehicles,
  getVehicle,
  listVehiclesByUser,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleHistory
};
