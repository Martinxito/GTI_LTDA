const express = require('express');
const router = express.Router();
const db = require('../db');
const verificarToken = require('../middleware/auth');

// Proteger todas las rutas de inventario
router.use(verificarToken);

// Obtener todos los repuestos
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM inventario');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener inventario' });
  }
});

// Agregar un nuevo repuesto
router.post('/', async (req, res) => {
  const { nombre, cantidad } = req.body;
  if (!nombre || cantidad == null) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO inventario (nombre, cantidad) VALUES ($1, $2) RETURNING id',
      [nombre, cantidad]
    );
    res.json({ id: result.rows[0].id, nombre, cantidad });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al agregar repuesto' });
  }
});

// Editar un repuesto existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, cantidad } = req.body;
  if (!nombre || cantidad == null) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  try {
    await db.query(
      'UPDATE inventario SET nombre = $1, cantidad = $2 WHERE id = $3',
      [nombre, cantidad, id]
    );
    res.json({ id, nombre, cantidad });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al editar repuesto' });
  }
});

// Eliminar un repuesto
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM inventario WHERE id = $1', [id]);
    res.json({ mensaje: 'Repuesto eliminado', id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar repuesto' });
  }
});

module.exports = router;