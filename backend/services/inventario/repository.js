const db = require('../../db');

async function listItems() {
  const [rows] = await db.query('SELECT * FROM inventario');
  return rows;
}

async function insertItem(data) {
  const [rows] = await db.query(
    `INSERT INTO inventario (nombre, descripcion, cantidad, cantidad_minima, precio_compra, precio_venta, categoria, codigo_barras, proveedor, ubicacion)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id`,
    [
      data.nombre,
      data.descripcion,
      data.cantidad,
      data.cantidad_minima,
      data.precio_compra,
      data.precio_venta,
      data.categoria,
      data.codigo_barras,
      data.proveedor,
      data.ubicacion
    ]
  );
  return rows[0];
}

async function updateItem(id, data) {
  await db.query(
    `UPDATE inventario SET
       nombre = $1,
       descripcion = $2,
       cantidad = $3,
       cantidad_minima = $4,
       precio_compra = $5,
       precio_venta = $6,
       categoria = $7,
       codigo_barras = $8,
       proveedor = $9,
       ubicacion = $10
     WHERE id = $11`,
    [
      data.nombre,
      data.descripcion,
      data.cantidad,
      data.cantidad_minima,
      data.precio_compra,
      data.precio_venta,
      data.categoria,
      data.codigo_barras,
      data.proveedor,
      data.ubicacion,
      id
    ]
  );
}

async function deleteItem(id) {
  await db.query('DELETE FROM inventario WHERE id = $1', [id]);
}

module.exports = {
  listItems,
  insertItem,
  updateItem,
  deleteItem
};
