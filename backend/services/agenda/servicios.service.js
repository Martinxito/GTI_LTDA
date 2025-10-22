const { ServiceError } = require('../utils/serviceError');
const repository = require('./servicios.repository');

async function listServices() {
  return repository.listServices();
}

async function listServicesByCategory(categoria) {
  if (!categoria) {
    throw new ServiceError('La categoría es obligatoria', { status: 400 });
  }
  return repository.listServicesByCategory(categoria);
}

async function getService(id) {
  const servicio = await repository.findServiceById(id);
  if (!servicio) {
    throw new ServiceError('Servicio no encontrado', { status: 404 });
  }
  return servicio;
}

async function createService(payload) {
  const { nombre, precio_base } = payload;
  if (!nombre || precio_base == null) {
    throw new ServiceError('Nombre y precio base son obligatorios', { status: 400 });
  }

  const data = {
    nombre,
    descripcion: payload.descripcion,
    precio_base,
    duracion_estimada: payload.duracion_estimada || 60,
    categoria: payload.categoria
  };

  const record = await repository.insertService(data);
  return { id: record.id, mensaje: 'Servicio creado exitosamente' };
}

async function updateService(id, payload) {
  await getService(id);

  const { nombre, precio_base } = payload;
  if (!nombre || precio_base == null) {
    throw new ServiceError('Nombre y precio base son obligatorios', { status: 400 });
  }

  const data = {
    nombre,
    descripcion: payload.descripcion,
    precio_base,
    duracion_estimada: payload.duracion_estimada || 60,
    categoria: payload.categoria
  };

  await repository.updateService(id, data);
  return { mensaje: 'Servicio actualizado exitosamente' };
}

async function deleteService(id) {
  await getService(id);
  await repository.deactivateService(id);
  return { mensaje: 'Servicio eliminado exitosamente' };
}

async function listCategories() {
  return repository.listCategories();
}

module.exports = {
  listServices,
  listServicesByCategory,
  getService,
  createService,
  updateService,
  deleteService,
  listCategories
};
