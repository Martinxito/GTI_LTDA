const { ServiceError } = require('../utils/serviceError');
const repository = require('./repository');
const historialService = require('../historial/service');

async function listVehicles() {
  return repository.listVehicles();
}

async function getVehicle(id) {
  const vehicle = await repository.findVehicleById(id);
  if (!vehicle) {
    throw new ServiceError('Vehículo no encontrado', { status: 404 });
  }
  return vehicle;
}

async function listVehiclesByClient(clienteId) {
  return repository.findVehiclesByClient(clienteId);
}

async function createVehicle(payload) {
  const {
    cliente_id,
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

  if (!cliente_id || !marca || !modelo || !año || !placa) {
    throw new ServiceError('Faltan datos obligatorios para registrar el vehículo', { status: 400 });
  }

  const data = {
    cliente_id,
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
    throw new ServiceError('No fue posible registrar el vehículo', { status: 500, details: error.message });
  }
}

async function updateVehicle(id, payload) {
  await getVehicle(id);

  const data = {
    marca: payload.marca,
    modelo: payload.modelo,
    año: payload.año,
    placa: payload.placa,
    color: payload.color,
    kilometraje: payload.kilometraje,
    tipo_combustible: payload.tipo_combustible,
    numero_motor: payload.numero_motor,
    numero_chasis: payload.numero_chasis,
    observaciones: payload.observaciones
  };

  if (!data.marca || !data.modelo || !data.año || !data.placa) {
    throw new ServiceError('Faltan datos obligatorios para actualizar el vehículo', { status: 400 });
  }

  try {
    await repository.updateVehicle(id, data);
    return { mensaje: 'Vehículo actualizado exitosamente' };
  } catch (error) {
    if (error.code === '23505') {
      throw new ServiceError('La placa ya está registrada', { status: 409 });
    }
    throw new ServiceError('No fue posible actualizar el vehículo', { status: 500, details: error.message });
  }
}

async function deleteVehicle(id) {
  await getVehicle(id);
  await repository.deactivateVehicle(id);
  return { mensaje: 'Vehículo eliminado exitosamente' };
}

async function getVehicleHistory(id) {
  await getVehicle(id);
  return historialService.listHistoryByVehicle(id);
}

module.exports = {
  listVehicles,
  getVehicle,
  listVehiclesByClient,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleHistory
};
