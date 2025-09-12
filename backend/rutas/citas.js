const express = require('express');
const router = express.Router();
const db = require('../db');
const verificarToken = require('../middleware/auth');

// Proteger todas las rutas de citas
router.use(verificarToken);

// Obtener todas las citas con información completa
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        c.*,
        u.nombre as cliente_nombre,
        u.apellido as cliente_apellido,
        u.telefono as cliente_telefono,
        v.marca as vehiculo_marca,
        v.modelo as vehiculo_modelo,
        v.placa as vehiculo_placa,
        s.nombre as servicio_nombre,
        s.precio_base as servicio_precio,
        m.nombre as mecanico_nombre
      FROM citas c
      LEFT JOIN clientes cl ON c.cliente_id = cl.id
      LEFT JOIN usuarios u ON cl.usuario_id = u.id
      LEFT JOIN vehiculos v ON c.vehiculo_id = v.id
      LEFT JOIN servicios s ON c.servicio_id = s.id
      LEFT JOIN usuarios m ON c.mecanico_id = m.id
      ORDER BY c.fecha_cita DESC, c.hora_inicio DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener citas' });
  }
});

// Obtener citas por fecha
router.get('/fecha/:fecha', async (req, res) => {
  const { fecha } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT 
        c.*,
        u.nombre as cliente_nombre,
        u.apellido as cliente_apellido,
        v.marca as vehiculo_marca,
        v.modelo as vehiculo_modelo,
        v.placa as vehiculo_placa,
        s.nombre as servicio_nombre,
        m.nombre as mecanico_nombre
      FROM citas c
      LEFT JOIN clientes cl ON c.cliente_id = cl.id
      LEFT JOIN usuarios u ON cl.usuario_id = u.id
      LEFT JOIN vehiculos v ON c.vehiculo_id = v.id
      LEFT JOIN servicios s ON c.servicio_id = s.id
      LEFT JOIN usuarios m ON c.mecanico_id = m.id
      WHERE c.fecha_cita = $1
      ORDER BY c.hora_inicio
    `, [fecha]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener citas por fecha' });
  }
});

// Obtener citas de un mecánico
router.get('/mecanico/:mecanicoId', async (req, res) => {
  const { mecanicoId } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT 
        c.*,
        u.nombre as cliente_nombre,
        u.apellido as cliente_apellido,
        v.marca as vehiculo_marca,
        v.modelo as vehiculo_modelo,
        v.placa as vehiculo_placa,
        s.nombre as servicio_nombre
      FROM citas c
      LEFT JOIN clientes cl ON c.cliente_id = cl.id
      LEFT JOIN usuarios u ON cl.usuario_id = u.id
      LEFT JOIN vehiculos v ON c.vehiculo_id = v.id
      LEFT JOIN servicios s ON c.servicio_id = s.id
      WHERE c.mecanico_id = $1
      ORDER BY c.fecha_cita DESC, c.hora_inicio DESC
    `, [mecanicoId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener citas del mecánico' });
  }
});

// Obtener una cita por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT 
        c.*,
        u.nombre as cliente_nombre,
        u.apellido as cliente_apellido,
        u.telefono as cliente_telefono,
        u.email as cliente_email,
        v.marca as vehiculo_marca,
        v.modelo as vehiculo_modelo,
        v.placa as vehiculo_placa,
        v.kilometraje as vehiculo_kilometraje,
        s.nombre as servicio_nombre,
        s.precio_base as servicio_precio,
        s.duracion_estimada as servicio_duracion,
        m.nombre as mecanico_nombre
      FROM citas c
      LEFT JOIN clientes cl ON c.cliente_id = cl.id
      LEFT JOIN usuarios u ON cl.usuario_id = u.id
      LEFT JOIN vehiculos v ON c.vehiculo_id = v.id
      LEFT JOIN servicios s ON c.servicio_id = s.id
      LEFT JOIN usuarios m ON c.mecanico_id = m.id
      WHERE c.id = $1
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener cita' });
  }
});

// Crear una nueva cita
router.post('/', async (req, res) => {
  const { 
    cliente_id, 
    vehiculo_id, 
    servicio_id, 
    mecanico_id, 
    fecha_cita, 
    hora_inicio, 
    observaciones 
  } = req.body;

  if (!cliente_id || !vehiculo_id || !servicio_id || !fecha_cita || !hora_inicio) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    // Calcular hora de fin basada en la duración del servicio
    const [servicio] = await db.query('SELECT duracion_estimada, precio_base FROM servicios WHERE id = $1', [servicio_id]);
    
    if (servicio.rows.length === 0) {
      return res.status(400).json({ error: 'Servicio no encontrado' });
    }

    const duracion = servicio.rows[0].duracion_estimada || 60;
    const precioBase = servicio.rows[0].precio_base || 0;
    
    // Calcular hora de fin
    const [horaInicio] = hora_inicio.split(':');
    const [minutosInicio] = hora_inicio.split(':').slice(1);
    const horaFin = parseInt(horaInicio) + Math.floor(duracion / 60);
    const minutosFin = (parseInt(minutosInicio) + (duracion % 60)) % 60;
    const hora_fin = `${horaFin.toString().padStart(2, '0')}:${minutosFin.toString().padStart(2, '0')}`;

    const [result] = await db.query(`
      INSERT INTO citas (
        cliente_id, vehiculo_id, servicio_id, mecanico_id, 
        fecha_cita, hora_inicio, hora_fin, observaciones, costo_total
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING id
    `, [
      cliente_id, vehiculo_id, servicio_id, mecanico_id, 
      fecha_cita, hora_inicio, hora_fin, observaciones, precioBase
    ]);

    res.json({ 
      id: result.rows[0].id, 
      mensaje: 'Cita creada exitosamente' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear cita' });
  }
});

// Actualizar una cita
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    vehiculo_id, 
    servicio_id, 
    mecanico_id, 
    fecha_cita, 
    hora_inicio, 
    estado,
    observaciones,
    diagnostico,
    costo_total 
  } = req.body;

  try {
    await db.query(`
      UPDATE citas SET 
        vehiculo_id = $1, servicio_id = $2, mecanico_id = $3, 
        fecha_cita = $4, hora_inicio = $5, estado = $6, 
        observaciones = $7, diagnostico = $8, costo_total = $9
      WHERE id = $10
    `, [
      vehiculo_id, servicio_id, mecanico_id, fecha_cita, hora_inicio, 
      estado, observaciones, diagnostico, costo_total, id
    ]);

    res.json({ mensaje: 'Cita actualizada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar cita' });
  }
});

// Actualizar estado de una cita
router.patch('/:id/estado', async (req, res) => {
  const { id } = req.params;
  const { estado, diagnostico } = req.body;

  if (!estado) {
    return res.status(400).json({ error: 'Estado es requerido' });
  }

  try {
    await db.query(`
      UPDATE citas SET estado = $1, diagnostico = $2
      WHERE id = $3
    `, [estado, diagnostico, id]);

    res.json({ mensaje: 'Estado de cita actualizado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar estado de cita' });
  }
});

// Eliminar una cita
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM citas WHERE id = $1', [id]);
    res.json({ mensaje: 'Cita eliminada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar cita' });
  }
});

// Obtener estadísticas de citas
router.get('/estadisticas/resumen', async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_citas,
        COUNT(CASE WHEN estado = 'Programada' THEN 1 END) as programadas,
        COUNT(CASE WHEN estado = 'En Proceso' THEN 1 END) as en_proceso,
        COUNT(CASE WHEN estado = 'Completada' THEN 1 END) as completadas,
        COUNT(CASE WHEN estado = 'Cancelada' THEN 1 END) as canceladas,
        COALESCE(SUM(costo_total), 0) as ingresos_totales
      FROM citas
    `);
    
    res.json(stats.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

module.exports = router;
