const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '290412',
  database: process.env.DB_NAME || 'gti_ltda',
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Iniciando migración completa a PostgreSQL...');

    await client.query(`
      DROP TABLE IF EXISTS
        repuestos_utilizados,
        historial_mantenimiento,
        citas,
        vehiculos,
        servicios,
        inventario,
        facturas,
        pagos,
        detalles_factura,
        clientes,
        usuarios
      CASCADE;
    `);
    console.log('✓ Tablas previas eliminadas');

    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        usuario VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol VARCHAR(20) NOT NULL CHECK (rol IN ('cliente', 'mecanico', 'jefe_taller')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabla usuarios creada');

    await client.query(`
      ALTER TABLE usuarios
      ADD COLUMN IF NOT EXISTS apellido VARCHAR(100),
      ADD COLUMN IF NOT EXISTS email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS telefono VARCHAR(20),
      ADD COLUMN IF NOT EXISTS direccion TEXT,
      ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE,
      ADD COLUMN IF NOT EXISTS documento_identidad VARCHAR(20),
      ADD COLUMN IF NOT EXISTS tipo_documento VARCHAR(10) DEFAULT 'CC',
      ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);
    console.log('✓ Columnas adicionales agregadas a usuarios');

    try {
      await client.query(`
        ALTER TABLE usuarios
        ADD CONSTRAINT usuarios_email_unique UNIQUE (email)
      `);
    } catch (_error) {
      // constraint may already exist
    }

    try {
      await client.query(`
        ALTER TABLE usuarios
        ADD CONSTRAINT usuarios_documento_unique UNIQUE (documento_identidad)
      `);
    } catch (_error) {
      // constraint may already exist
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS vehiculos (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        marca VARCHAR(50) NOT NULL,
        modelo VARCHAR(50) NOT NULL,
        año INTEGER NOT NULL,
        placa VARCHAR(10) UNIQUE NOT NULL,
        color VARCHAR(30),
        kilometraje INTEGER DEFAULT 0,
        tipo_combustible VARCHAR(20) DEFAULT 'Gasolina',
        numero_motor VARCHAR(50),
        numero_chasis VARCHAR(50),
        observaciones TEXT,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabla vehículos creada');

    await client.query(`
      CREATE TABLE IF NOT EXISTS servicios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        precio_base DECIMAL(10,2) NOT NULL DEFAULT 0,
        duracion_estimada INTEGER DEFAULT 60,
        categoria VARCHAR(50),
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabla servicios creada');

    await client.query(`
      CREATE TABLE IF NOT EXISTS citas (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        vehiculo_id INTEGER REFERENCES vehiculos(id) ON DELETE CASCADE,
        servicio_id INTEGER REFERENCES servicios(id),
        mecanico_id INTEGER REFERENCES usuarios(id),
        fecha_cita DATE NOT NULL,
        hora_inicio TIME NOT NULL,
        hora_fin TIME,
        estado VARCHAR(20) DEFAULT 'Programada' CHECK (estado IN ('Programada', 'En Proceso', 'Completada', 'Cancelada', 'Reprogramada')),
        observaciones TEXT,
        diagnostico TEXT,
        costo_total DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabla citas creada');

    await client.query(`
      CREATE TABLE IF NOT EXISTS inventario (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        cantidad INTEGER NOT NULL DEFAULT 0,
        cantidad_minima INTEGER DEFAULT 5,
        precio_compra DECIMAL(10,2) DEFAULT 0,
        precio_venta DECIMAL(10,2) DEFAULT 0,
        categoria VARCHAR(50),
        codigo_barras VARCHAR(50),
        proveedor VARCHAR(100),
        ubicacion VARCHAR(50),
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabla inventario creada');

    await client.query(`
      CREATE TABLE IF NOT EXISTS repuestos_utilizados (
        id SERIAL PRIMARY KEY,
        cita_id INTEGER REFERENCES citas(id) ON DELETE CASCADE,
        inventario_id INTEGER REFERENCES inventario(id),
        cantidad_utilizada INTEGER NOT NULL,
        precio_unitario DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabla repuestos_utilizados creada');

    await client.query(`
      CREATE TABLE IF NOT EXISTS historial_mantenimiento (
        id SERIAL PRIMARY KEY,
        vehiculo_id INTEGER REFERENCES vehiculos(id) ON DELETE CASCADE,
        cita_id INTEGER REFERENCES citas(id),
        tipo_mantenimiento VARCHAR(50),
        descripcion TEXT NOT NULL,
        kilometraje_actual INTEGER,
        proximo_mantenimiento_km INTEGER,
        proximo_mantenimiento_fecha DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabla historial_mantenimiento creada');

    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    const tables = ['usuarios', 'vehiculos', 'servicios', 'citas', 'inventario'];
    for (const table of tables) {
      await client.query(`
        DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
        CREATE TRIGGER update_${table}_updated_at
          BEFORE UPDATE ON ${table}
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `);
    }
    console.log('✓ Triggers para updated_at creados');

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
      CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);
      CREATE INDEX IF NOT EXISTS idx_vehiculos_usuario ON vehiculos(usuario_id);
      CREATE INDEX IF NOT EXISTS idx_vehiculos_placa ON vehiculos(placa);
      CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha_cita);
      CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);
      CREATE INDEX IF NOT EXISTS idx_citas_mecanico ON citas(mecanico_id);
      CREATE INDEX IF NOT EXISTS idx_inventario_categoria ON inventario(categoria);
    `);
    console.log('✓ Índices creados');

    const bcrypt = require('bcryptjs');

    const usuariosPrueba = [
      {
        nombre: 'Administrador',
        apellido: 'Sistema',
        email: 'admin@gti.com',
        telefono: '3001234567',
        usuario: 'admin',
        password: 'admin123',
        rol: 'jefe_taller'
      },
      {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan.perez@email.com',
        telefono: '3007654321',
        direccion: 'Calle 123 #45-67, Bogotá',
        documento_identidad: 'CC100000001',
        tipo_documento: 'CC',
        usuario: 'cliente',
        password: 'cliente123',
        rol: 'cliente'
      },
      {
        nombre: 'Carlos',
        apellido: 'Mecánico',
        email: 'carlos.mecanico@gti.com',
        telefono: '3009876543',
        usuario: 'mecanico',
        password: 'mecanico123',
        rol: 'mecanico'
      },
      {
        nombre: 'Ana',
        apellido: 'García',
        email: 'ana.garcia@email.com',
        telefono: '3005555555',
        direccion: 'Carrera 10 #20-30, Medellín',
        documento_identidad: 'CC100000002',
        tipo_documento: 'CC',
        usuario: 'ana',
        password: 'ana123',
        rol: 'cliente'
      }
    ];

    for (const usuario of usuariosPrueba) {
      const usuarioExists = await client.query('SELECT id FROM usuarios WHERE usuario = $1', [usuario.usuario]);
      if (usuarioExists.rows.length === 0) {
        const hashedPassword = await bcrypt.hash(usuario.password, 10);
        await client.query(
          `INSERT INTO usuarios (
            nombre, apellido, email, telefono, direccion,
            documento_identidad, tipo_documento, usuario, password, rol
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            usuario.nombre,
            usuario.apellido,
            usuario.email,
            usuario.telefono,
            usuario.direccion || null,
            usuario.documento_identidad || null,
            usuario.tipo_documento || null,
            usuario.usuario,
            hashedPassword,
            usuario.rol
          ]
        );
        console.log(`✓ Usuario ${usuario.usuario} creado (password: ${usuario.password})`);
      }
    }

    const vehiculosExists = await client.query('SELECT COUNT(*) FROM vehiculos');
    if (parseInt(vehiculosExists.rows[0].count) === 0) {
      const usuarios = await client.query("SELECT id FROM usuarios WHERE rol = 'cliente' LIMIT 2");

      await client.query(`
        INSERT INTO vehiculos (usuario_id, marca, modelo, año, placa, color, kilometraje, tipo_combustible) VALUES
        ($1, 'Toyota', 'Corolla', 2020, 'ABC123', 'Blanco', 45000, 'Gasolina'),
        ($2, 'Ford', 'Fiesta', 2019, 'XYZ789', 'Azul', 38000, 'Gasolina'),
        ($1, 'Honda', 'Civic', 2021, 'DEF456', 'Negro', 25000, 'Gasolina')
      `, [usuarios.rows[0].id, usuarios.rows[1]?.id || usuarios.rows[0].id]);
      console.log('✓ Datos de ejemplo insertados en vehículos');
    }

    const serviciosExists = await client.query('SELECT COUNT(*) FROM servicios');
    if (parseInt(serviciosExists.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO servicios (nombre, descripcion, precio_base, duracion_estimada, categoria) VALUES
        ('Cambio de aceite', 'Cambio de aceite y filtro', 45000, 30, 'Mantenimiento'),
        ('Revisión de frenos', 'Revisión y ajuste del sistema de frenos', 80000, 60, 'Mantenimiento'),
        ('Alineación y balanceo', 'Alineación y balanceo de llantas', 120000, 45, 'Mantenimiento'),
        ('Diagnóstico general', 'Diagnóstico computarizado del vehículo', 60000, 30, 'Diagnóstico'),
        ('Reparación de motor', 'Reparación general del motor', 500000, 240, 'Reparación')
      `);
      console.log('✓ Datos de ejemplo insertados en servicios');
    }

    const inventarioExists = await client.query('SELECT COUNT(*) FROM inventario');
    if (parseInt(inventarioExists.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO inventario (nombre, descripcion, cantidad, cantidad_minima, precio_compra, precio_venta, categoria, proveedor) VALUES
        ('Filtro de aceite', 'Filtro de aceite para motor', 25, 5, 15000, 25000, 'Repuestos', 'Repuestos ABC'),
        ('Pastillas de freno', 'Pastillas de freno delanteras', 15, 3, 45000, 75000, 'Repuestos', 'Frenos XYZ'),
        ('Bujías', 'Bujías de encendido', 50, 10, 8000, 15000, 'Eléctricos 123'),
        ('Aceite motor 5W-30', 'Aceite sintético 5W-30', 12, 5, 25000, 40000, 'Lubricantes', 'Lubricantes Plus'),
        ('Líquido de frenos', 'Líquido de frenos DOT 4', 8, 2, 12000, 20000, 'Lubricantes', 'Frenos XYZ'),
        ('Filtro de aire', 'Filtro de aire del motor', 20, 5, 18000, 30000, 'Repuestos', 'Repuestos ABC')
      `);
      console.log('✓ Datos de ejemplo insertados en inventario');
    }

    const citasExists = await client.query('SELECT COUNT(*) FROM citas');
    if (parseInt(citasExists.rows[0].count) === 0) {
      const usuarios = await client.query("SELECT id FROM usuarios WHERE rol = 'cliente' LIMIT 2");
      const vehiculos = await client.query('SELECT id FROM vehiculos LIMIT 2');
      const servicios = await client.query('SELECT id FROM servicios LIMIT 3');
      const mecanico = await client.query("SELECT id FROM usuarios WHERE rol = 'mecanico' LIMIT 1");

      if (usuarios.rows.length > 0 && vehiculos.rows.length > 0 && servicios.rows.length > 0 && mecanico.rows.length > 0) {
        await client.query(`
          INSERT INTO citas (usuario_id, vehiculo_id, servicio_id, mecanico_id, fecha_cita, hora_inicio, estado, costo_total) VALUES
          ($1, $2, $3, $4, '2025-01-20', '10:00', 'Programada', 45000),
          ($5, $6, $7, $4, '2025-01-21', '14:00', 'En Proceso', 80000),
          ($1, $2, $8, $4, '2025-01-22', '09:00', 'Completada', 120000)
        `, [
          usuarios.rows[0].id, vehiculos.rows[0].id, servicios.rows[0].id, mecanico.rows[0].id,
          usuarios.rows[1]?.id || usuarios.rows[0].id, vehiculos.rows[1]?.id || vehiculos.rows[0].id, servicios.rows[1].id,
          servicios.rows[2].id
        ]);
        console.log('✓ Datos de ejemplo insertados en citas');
      }
    }

    console.log('🎉 Migración completada exitosamente!');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  migrate();
}

module.exports = migrate;
