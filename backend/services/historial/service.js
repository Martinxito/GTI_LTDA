const { ServiceError } = require('../utils/serviceError');
const repository = require('./repository');

async function listHistoryByVehicle(vehiculoId) {
  if (!vehiculoId) {
    throw new ServiceError('El identificador del vehículo es obligatorio', { status: 400 });
  }
  return repository.listHistoryByVehicle(vehiculoId);
}

async function registerHistoryEntry(payload) {
  const {
    vehiculo_id,
    cita_id,
    tipo_mantenimiento,
    descripcion,
    kilometraje_actual,
    proximo_mantenimiento_km,
    proximo_mantenimiento_fecha
  } = payload;

  if (!vehiculo_id || !descripcion) {
    throw new ServiceError('Vehículo y descripción son obligatorios para registrar el historial', { status: 400 });
  }

  const data = {
    vehiculo_id,
    cita_id,
    tipo_mantenimiento,
    descripcion,
    kilometraje_actual,
    proximo_mantenimiento_km,
    proximo_mantenimiento_fecha
  };

  try {
    const record = await repository.insertHistoryEntry(data);
    return { id: record.id, mensaje: 'Historial registrado exitosamente' };
  } catch (error) {
    throw new ServiceError('No fue posible registrar el historial', { status: 500, details: error.message });
  }
}

module.exports = {
  listHistoryByVehicle,
  registerHistoryEntry
};
