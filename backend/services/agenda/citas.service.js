const { ServiceError } = require('../utils/serviceError');
const repository = require('./citas.repository');
const serviciosRepository = require('./servicios.repository');
const usuariosRepository = require('../identity/repository');
const vehiculosRepository = require('../vehiculos/repository');

function calculateEndTime(horaInicio, duracionEstimada) {
  const [hora, minutos] = horaInicio.split(':').map(Number);
  const totalMinutos = hora * 60 + minutos + duracionEstimada;
  const finHora = Math.floor(totalMinutos / 60) % 24;
  const finMinutos = totalMinutos % 60;
  return `${finHora.toString().padStart(2, '0')}:${finMinutos.toString().padStart(2, '0')}`;
}

async function listAppointments(user) {
  if (user?.rol === 'cliente') {
    return repository.listAppointmentsByUser(user.id);
  }

  if (user?.rol === 'mecanico') {
    return repository.listAppointmentsByMechanic(user.id);
  }

  return repository.listAppointments();
}

async function listAppointmentsByDate(fecha, user) {
  if (!fecha) {
    throw new ServiceError('La fecha es obligatoria', { status: 400 });
  }

  if (user?.rol === 'cliente') {
    return repository.listAppointmentsByDateAndUser(fecha, user.id);
  }

  if (user?.rol === 'mecanico') {
    const citas = await repository.listAppointmentsByDate(fecha);
    return citas.filter((cita) => Number(cita.mecanico_id) === Number(user.id));
  }

  return repository.listAppointmentsByDate(fecha);
}

async function listAppointmentsByMechanic(mecanicoId, user) {
  if (!mecanicoId) {
    throw new ServiceError('El identificador del mecánico es obligatorio', { status: 400 });
  }

  if (user?.rol === 'cliente') {
    throw new ServiceError('No autorizado para consultar citas de otros usuarios', { status: 403 });
  }

  if (user?.rol === 'mecanico' && Number(mecanicoId) !== Number(user.id)) {
    throw new ServiceError('No autorizado para consultar citas de otros mecánicos', { status: 403 });
  }

  return repository.listAppointmentsByMechanic(mecanicoId);
}

async function getAppointment(id, user) {
  const cita = await repository.findAppointmentById(id);
  if (!cita) {
    throw new ServiceError('Cita no encontrada', { status: 404 });
  }

  if (user?.rol === 'cliente' && Number(cita.usuario_id) !== Number(user.id)) {
    throw new ServiceError('No autorizado para acceder a esta cita', { status: 403 });
  }

  if (user?.rol === 'mecanico' && cita.mecanico_id && Number(cita.mecanico_id) !== Number(user.id)) {
    throw new ServiceError('No autorizado para acceder a esta cita', { status: 403 });
  }

  return cita;
}

async function createAppointment(payload, user) {
  const {
    usuario_id,
    vehiculo_id,
    servicio_id,
    mecanico_id,
    fecha_cita,
    hora_inicio,
    observaciones
  } = payload;

  if (!usuario_id || !vehiculo_id || !servicio_id || !fecha_cita || !hora_inicio) {
    throw new ServiceError('Faltan datos obligatorios para crear la cita', { status: 400 });
  }

  if (user?.rol === 'cliente' && Number(usuario_id) !== Number(user.id)) {
    throw new ServiceError('No autorizado para crear citas para otros usuarios', { status: 403 });
  }

  const usuario = await usuariosRepository.findById(usuario_id);
  if (!usuario) {
    throw new ServiceError('Usuario no encontrado', { status: 400 });
  }

  const vehiculo = await vehiculosRepository.findVehicleById(vehiculo_id);
  if (!vehiculo) {
    throw new ServiceError('Vehículo no encontrado', { status: 400 });
  }

  if (vehiculo.usuario_id !== usuario_id) {
    throw new ServiceError('El vehículo no pertenece al usuario especificado', { status: 400 });
  }

  const servicio = await serviciosRepository.findServiceById(servicio_id);
  if (!servicio) {
    throw new ServiceError('Servicio no encontrado', { status: 400 });
  }

  const hora_fin = calculateEndTime(hora_inicio, servicio.duracion_estimada || 60);

  const data = {
    usuario_id,
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

async function updateAppointment(id, payload, user) {
  const existing = await getAppointment(id, user);

  const usuarioId = payload.usuario_id || existing.usuario_id;
  const vehiculoId = payload.vehiculo_id || existing.vehiculo_id;

  if (user?.rol === 'cliente' && Number(usuarioId) !== Number(user.id)) {
    throw new ServiceError('No autorizado para actualizar citas de otros usuarios', { status: 403 });
  }

  const usuario = await usuariosRepository.findById(usuarioId);
  if (!usuario) {
    throw new ServiceError('Usuario no encontrado', { status: 400 });
  }

  const vehiculo = await vehiculosRepository.findVehicleById(vehiculoId);
  if (!vehiculo) {
    throw new ServiceError('Vehículo no encontrado', { status: 400 });
  }

  if (vehiculo.usuario_id !== usuarioId) {
    throw new ServiceError('El vehículo no pertenece al usuario especificado', { status: 400 });
  }

  const servicioId = payload.servicio_id || existing.servicio_id;
  const servicio = await serviciosRepository.findServiceById(servicioId);
  if (!servicio) {
    throw new ServiceError('Servicio no encontrado', { status: 400 });
  }

  const horaInicio = payload.hora_inicio || existing.hora_inicio;
  const horaFin = payload.hora_fin || calculateEndTime(horaInicio, servicio.duracion_estimada || 60);

  const data = {
    usuario_id: usuarioId,
    vehiculo_id: vehiculoId,
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

  if (!data.usuario_id || !data.vehiculo_id || !data.servicio_id || !data.fecha_cita || !data.hora_inicio) {
    throw new ServiceError('Faltan datos obligatorios para actualizar la cita', { status: 400 });
  }

  await repository.updateAppointment(id, data);
  return { mensaje: 'Cita actualizada exitosamente' };
}

async function cancelAppointment(id, observaciones, user) {
  await getAppointment(id, user);
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
