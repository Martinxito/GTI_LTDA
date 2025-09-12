const express = require('express');
const router = express.Router();
const db = require('../db');
const verificarToken = require('../middleware/auth');

// Proteger todas las rutas de vehículos
router.use(verificarToken);

// Obtener todos los vehículos con información del cliente
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        v.*,
        u.nombre as cliente_nombre,
        u.apellido as cliente_apellido,
        u.telefono as cliente_telefono
      FROM vehiculos v
      JOIN clientes c ON v.cliente_id = c.id
      JOIN usuarios u ON c.usuario_id = u.id
      WHERE v.activo = true
      ORDER BY v.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener vehículos' });
  }
});

// Obtener vehículos de un cliente específico
router.get('/cliente/:clienteId', async (req, res) => {
  const { clienteId } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT v.*
      FROM vehiculos v
      WHERE v.cliente_id = $1 AND v.activo = true
      ORDER BY v.created_at DESC
    `, [clienteId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener vehículos del cliente' });
  }
});

// Obtener un vehículo por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT 
        v.*,
        u.nombre as cliente_nombre,
        u.apellido as cliente_apellido,
        u.telefono as cliente_telefono,
        u.email as cliente_email
      FROM vehiculos v
      JOIN clientes c ON v.cliente_id = c.id
      JOIN usuarios u ON c.usuario_id = u.id
      WHERE v.id = $1 AND v.activo = true
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener vehículo' });
  }
});

// Crear un nuevo vehículo
router.post('/', async (req, res) => {
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
  } = req.body;

  if (!cliente_id || !marca || !modelo || !año || !placa) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const [result] = await db.query(`
      INSERT INTO vehiculos (
        cliente_id, marca, modelo, año, placa, color, kilometraje, 
        tipo_combustible, numero_motor, numero_chasis, observaciones
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING id
    `, [
      cliente_id, marca, modelo, año, placa, color, kilometraje || 0,
      tipo_combustible || 'Gasolina', numero_motor, numero_chasis, observaciones
    ]);

    res.json({ 
      id: result.rows[0].id, 
      mensaje: 'Vehículo creado exitosamente' 
    });
  } catch (error) {
    console.error(error);
    if (error.code === '23505') { // Violación de restricción única
      res.status(400).json({ error: 'La placa ya está registrada' });
    } else {
      res.status(500).json({ error: 'Error al crear vehículo' });
    }
  }
});

// Actualizar un vehículo
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { 
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
  } = req.body;

  if (!marca || !modelo || !año || !placa) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    await db.query(`
      UPDATE vehiculos SET 
        marca = $1, modelo = $2, año = $3, placa = $4, color = $5, 
        kilometraje = $6, tipo_combustible = $7, numero_motor = $8, 
        numero_chasis = $9, observaciones = $10
      WHERE id = $11 AND activo = true
    `, [
      marca, modelo, año, placa, color, kilometraje, tipo_combustible,
      numero_motor, numero_chasis, observaciones, id
    ]);

    res.json({ mensaje: 'Vehículo actualizado exitosamente' });
  } catch (error) {
    console.error(error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'La placa ya está registrada' });
    } else {
      res.status(500).json({ error: 'Error al actualizar vehículo' });
    }
  }
});

// Eliminar un vehículo (soft delete)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('UPDATE vehiculos SET activo = false WHERE id = $1', [id]);
    res.json({ mensaje: 'Vehículo eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar vehículo' });
  }
});

// Obtener historial de mantenimiento de un vehículo
router.get('/:id/historial', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT 
        h.*,
        s.nombre as servicio_nombre,
        u.nombre as mecanico_nombre
      FROM historial_mantenimiento h
      LEFT JOIN citas c ON h.cita_id = c.id
      LEFT JOIN servicios s ON c.servicio_id = s.id
      LEFT JOIN usuarios u ON c.mecanico_id = u.id
      WHERE h.vehiculo_id = $1
      ORDER BY h.created_at DESC
    `, [id]);
    
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener historial del vehículo' });
  }
});

module.exports = router;
