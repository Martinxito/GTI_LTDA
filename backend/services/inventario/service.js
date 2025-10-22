const { ServiceError } = require('../utils/serviceError');
const repository = require('./repository');

async function listItems() {
  return repository.listItems();
}

async function createItem(payload) {
  const { nombre, cantidad } = payload;

  if (!nombre || cantidad == null) {
    throw new ServiceError('Nombre y cantidad son obligatorios', { status: 400 });
  }

  const data = {
    nombre,
    descripcion: payload.descripcion,
    cantidad,
    cantidad_minima: payload.cantidad_minima || 5,
    precio_compra: payload.precio_compra || 0,
    precio_venta: payload.precio_venta || 0,
    categoria: payload.categoria,
    codigo_barras: payload.codigo_barras,
    proveedor: payload.proveedor,
    ubicacion: payload.ubicacion
  };

  const record = await repository.insertItem(data);
  return { id: record.id, ...data };
}

async function updateItem(id, payload) {
  const { nombre, cantidad } = payload;

  if (!nombre || cantidad == null) {
    throw new ServiceError('Nombre y cantidad son obligatorios', { status: 400 });
  }

  const data = {
    nombre,
    descripcion: payload.descripcion,
    cantidad,
    cantidad_minima: payload.cantidad_minima || 5,
    precio_compra: payload.precio_compra || 0,
    precio_venta: payload.precio_venta || 0,
    categoria: payload.categoria,
    codigo_barras: payload.codigo_barras,
    proveedor: payload.proveedor,
    ubicacion: payload.ubicacion
  };

  await repository.updateItem(id, data);
  return { id: Number(id), ...data };
}

async function deleteItem(id) {
  await repository.deleteItem(id);
  return { mensaje: 'Repuesto eliminado', id: Number(id) };
}

module.exports = {
  listItems,
  createItem,
  updateItem,
  deleteItem
};
