const express = require('express');
const router = express.Router();
const db = require('../db');
const verificarToken = require('../middleware/auth');

// Proteger todas las rutas de clientes
router.use(verificarToken);

// Obtener todos los clientes con información completa
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        c.*,
        u.nombre,
        u.apellido,
        u.email,
        u.telefono,
        u.activo as usuario_activo,
        COUNT(v.id) as total_vehiculos
      FROM clientes c
      JOIN usuarios u ON c.usuario_id = u.id
      LEFT JOIN vehiculos v ON c.id = v.cliente_id AND v.activo = true
      WHERE u.rol = 'cliente' AND u.activo = true
      GROUP BY c.id, u.id
      ORDER BY u.nombre, u.apellido
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// Obtener un cliente por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT 
        c.*,
        u.nombre,
        u.apellido,
        u.email,
        u.telefono,
        u.activo as usuario_activo
      FROM clientes c
      JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.id = $1 AND u.rol = 'cliente'
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
});

// Crear un nuevo cliente
router.post('/', async (req, res) => {
  const { 
    nombre, 
    apellido, 
    email, 
    telefono, 
    direccion, 
    fecha_nacimiento, 
    documento_identidad, 
    tipo_documento,
    password 
  } = req.body;

  if (!nombre || !email || !telefono || !documento_identidad || !password) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario primero
    const [usuarioResult] = await db.query(`
      INSERT INTO usuarios (nombre, apellido, email, telefono, usuario, password, rol) 
      VALUES ($1, $2, $3, $4, $5, $6, 'cliente') 
      RETURNING id
    `, [nombre, apellido, email, telefono, email, hashedPassword]);

    // Crear cliente
    const [clienteResult] = await db.query(`
      INSERT INTO clientes (usuario_id, direccion, fecha_nacimiento, documento_identidad, tipo_documento) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id
    `, [usuarioResult.rows[0].id, direccion, fecha_nacimiento, documento_identidad, tipo_documento || 'CC']);

    res.json({ 
      id: clienteResult.rows[0].id, 
      usuario_id: usuarioResult.rows[0].id,
      mensaje: 'Cliente creado exitosamente' 
    });
  } catch (error) {
    console.error(error);
    if (error.code === '23505') { // Violación de restricción única
      res.status(400).json({ error: 'El email o documento ya está registrado' });
    } else {
      res.status(500).json({ error: 'Error al crear cliente' });
    }
  }
});

// Actualizar un cliente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    nombre, 
    apellido, 
    email, 
    telefono, 
    direccion, 
    fecha_nacimiento, 
    documento_identidad, 
    tipo_documento 
  } = req.body;

  try {
    // Obtener el usuario_id del cliente
    const [cliente] = await db.query('SELECT usuario_id FROM clientes WHERE id = $1', [id]);
    
    if (cliente.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const usuarioId = cliente.rows[0].usuario_id;

    // Actualizar usuario
    await db.query(`
      UPDATE usuarios SET 
        nombre = $1, apellido = $2, email = $3, telefono = $4
      WHERE id = $5
    `, [nombre, apellido, email, telefono, usuarioId]);

    // Actualizar cliente
    await db.query(`
      UPDATE clientes SET 
        direccion = $1, fecha_nacimiento = $2, documento_identidad = $3, tipo_documento = $4
      WHERE id = $5
    `, [direccion, fecha_nacimiento, documento_identidad, tipo_documento, id]);

    res.json({ mensaje: 'Cliente actualizado exitosamente' });
  } catch (error) {
    console.error(error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'El email o documento ya está registrado' });
    } else {
      res.status(500).json({ error: 'Error al actualizar cliente' });
    }
  }
});

// Eliminar un cliente (soft delete)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Obtener el usuario_id del cliente
    const [cliente] = await db.query('SELECT usuario_id FROM clientes WHERE id = $1', [id]);
    
    if (cliente.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const usuarioId = cliente.rows[0].usuario_id;

    // Desactivar usuario
    await db.query('UPDATE usuarios SET activo = false WHERE id = $1', [usuarioId]);

    res.json({ mensaje: 'Cliente eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
});

// Obtener vehículos de un cliente
router.get('/:id/vehiculos', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT * FROM vehiculos 
      WHERE cliente_id = $1 AND activo = true 
      ORDER BY created_at DESC
    `, [id]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener vehículos del cliente' });
  }
});

// Obtener citas de un cliente
router.get('/:id/citas', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT 
        c.*,
        v.marca as vehiculo_marca,
        v.modelo as vehiculo_modelo,
        v.placa as vehiculo_placa,
        s.nombre as servicio_nombre,
        m.nombre as mecanico_nombre
      FROM citas c
      LEFT JOIN vehiculos v ON c.vehiculo_id = v.id
      LEFT JOIN servicios s ON c.servicio_id = s.id
      LEFT JOIN usuarios m ON c.mecanico_id = m.id
      WHERE c.cliente_id = $1
      ORDER BY c.fecha_cita DESC, c.hora_inicio DESC
    `, [id]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener citas del cliente' });
  }
});

// Buscar clientes por nombre o documento
router.get('/buscar/:termino', async (req, res) => {
  const { termino } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT 
        c.*,
        u.nombre,
        u.apellido,
        u.email,
        u.telefono
      FROM clientes c
      JOIN usuarios u ON c.usuario_id = u.id
      WHERE u.rol = 'cliente' AND u.activo = true 
      AND (
        LOWER(u.nombre) LIKE LOWER($1) OR 
        LOWER(u.apellido) LIKE LOWER($1) OR 
        LOWER(c.documento_identidad) LIKE LOWER($1) OR
        LOWER(u.email) LIKE LOWER($1)
      )
      ORDER BY u.nombre, u.apellido
    `, [`%${termino}%`]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al buscar clientes' });
  }
});

module.exports = router;
