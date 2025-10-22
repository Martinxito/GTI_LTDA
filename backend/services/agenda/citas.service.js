const { ServiceError } = require('../utils/serviceError');
const repository = require('./citas.repository');
const serviciosRepository = require('./servicios.repository');

function calculateEndTime(horaInicio, duracionEstimada) {
  const [hora, minutos] = horaInicio.split(':').map(Number);
  const totalMinutos = hora * 60 + minutos + duracionEstimada;
  const finHora = Math.floor(totalMinutos / 60) % 24;
  const finMinutos = totalMinutos % 60;
  return `${finHora.toString().padStart(2, '0')}:${finMinutos.toString().padStart(2, '0')}`;
}

async function listAppointments() {
  return repository.listAppointments();
}

async function listAppointmentsByDate(fecha) {
  if (!fecha) {
    throw new ServiceError('La fecha es obligatoria', { status: 400 });
  }
  return repository.listAppointmentsByDate(fecha);
}

async function listAppointmentsByMechanic(mecanicoId) {
  if (!mecanicoId) {
    throw new ServiceError('El identificador del mecánico es obligatorio', { status: 400 });
  }
  return repository.listAppointmentsByMechanic(mecanicoId);
}

async function getAppointment(id) {
  const cita = await repository.findAppointmentById(id);
  if (!cita) {
    throw new ServiceError('Cita no encontrada', { status: 404 });
  }
  return cita;
}

async function createAppointment(payload) {
  const {
    cliente_id,
    vehiculo_id,
    servicio_id,
    mecanico_id,
    fecha_cita,
    hora_inicio,
    observaciones
  } = payload;

  if (!cliente_id || !vehiculo_id || !servicio_id || !fecha_cita || !hora_inicio) {
    throw new ServiceError('Faltan datos obligatorios para crear la cita', { status: 400 });
  }

  const servicio = await serviciosRepository.findServiceById(servicio_id);
  if (!servicio) {
    throw new ServiceError('Servicio no encontrado', { status: 400 });
  }

  const hora_fin = calculateEndTime(hora_inicio, servicio.duracion_estimada || 60);

  const data = {
    cliente_id,
    vehiculo_id,
    servicio_id,
    mecanico_id,
    fecha_cita,
    hora_inicio,
    hora_fin,
    observaciones,
    costo_total: servicio.precio_base || 0
  };

  try {
    const record = await repository.insertAppointment(data);
    return { id: record.id, mensaje: 'Cita creada exitosamente' };
  } catch (error) {
    throw new ServiceError('No fue posible crear la cita', { status: 500, details: error.message });
  }
}

async function updateAppointment(id, payload) {
  const existing = await getAppointment(id);

  const servicioId = payload.servicio_id || existing.servicio_id;
  const servicio = await serviciosRepository.findServiceById(servicioId);
  if (!servicio) {
    throw new ServiceError('Servicio no encontrado', { status: 400 });
  }

  const horaInicio = payload.hora_inicio || existing.hora_inicio;
  const horaFin = payload.hora_fin || calculateEndTime(horaInicio, servicio.duracion_estimada || 60);

  const data = {
    vehiculo_id: payload.vehiculo_id || existing.vehiculo_id,
    servicio_id: servicioId,
    mecanico_id: payload.mecanico_id || existing.mecanico_id,
    fecha_cita: payload.fecha_cita || existing.fecha_cita,
    hora_inicio: horaInicio,
    hora_fin: horaFin,
    estado: payload.estado || existing.estado,
    observaciones: payload.observaciones ?? existing.observaciones,
    diagnostico: payload.diagnostico ?? existing.diagnostico,
    costo_total: payload.costo_total ?? existing.costo_total
  };

  if (!data.vehiculo_id || !data.servicio_id || !data.fecha_cita || !data.hora_inicio) {
    throw new ServiceError('Faltan datos obligatorios para actualizar la cita', { status: 400 });
  }

  await repository.updateAppointment(id, data);
  return { mensaje: 'Cita actualizada exitosamente' };
}

async function cancelAppointment(id, observaciones) {
  await getAppointment(id);
  await repository.updateAppointmentStatus(id, 'Cancelada');
  if (observaciones) {
    await repository.updateAppointmentNotes(id, observaciones);
  }
  return { mensaje: 'Cita cancelada exitosamente' };
}

module.exports = {
  listAppointments,
  listAppointmentsByDate,
  listAppointmentsByMechanic,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment
};
