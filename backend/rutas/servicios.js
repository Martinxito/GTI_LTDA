const express = require('express');
const router = express.Router();
const db = require('../db');
const verificarToken = require('../middleware/auth');

// Proteger todas las rutas de servicios
router.use(verificarToken);

// Obtener todos los servicios
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM servicios 
      WHERE activo = true 
      ORDER BY categoria, nombre
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener servicios' });
  }
});

// Obtener servicios por categoría
router.get('/categoria/:categoria', async (req, res) => {
  const { categoria } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT * FROM servicios 
      WHERE categoria = $1 AND activo = true 
      ORDER BY nombre
    `, [categoria]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener servicios por categoría' });
  }
});

// Obtener un servicio por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM servicios WHERE id = $1 AND activo = true', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener servicio' });
  }
});

// Crear un nuevo servicio
router.post('/', async (req, res) => {
  const { nombre, descripcion, precio_base, duracion_estimada, categoria } = req.body;

  if (!nombre || !precio_base) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const [result] = await db.query(`
      INSERT INTO servicios (nombre, descripcion, precio_base, duracion_estimada, categoria) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id
    `, [nombre, descripcion, precio_base, duracion_estimada || 60, categoria]);

    res.json({ 
      id: result.rows[0].id, 
      mensaje: 'Servicio creado exitosamente' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear servicio' });
  }
});

// Actualizar un servicio
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio_base, duracion_estimada, categoria } = req.body;

  if (!nombre || !precio_base) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    await db.query(`
      UPDATE servicios SET 
        nombre = $1, descripcion = $2, precio_base = $3, 
        duracion_estimada = $4, categoria = $5
      WHERE id = $6 AND activo = true
    `, [nombre, descripcion, precio_base, duracion_estimada, categoria, id]);

    res.json({ mensaje: 'Servicio actualizado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar servicio' });
  }
});

// Eliminar un servicio (soft delete)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('UPDATE servicios SET activo = false WHERE id = $1', [id]);
    res.json({ mensaje: 'Servicio eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar servicio' });
  }
});

// Obtener categorías de servicios
router.get('/categorias/list', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DISTINCT categoria 
      FROM servicios 
      WHERE activo = true AND categoria IS NOT NULL 
      ORDER BY categoria
    `);
    res.json(rows.map(row => row.categoria));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

module.exports = router;
