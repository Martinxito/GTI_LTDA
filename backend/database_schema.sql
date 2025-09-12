-- Esquema completo de la base de datos para GTI LTDA
-- Sistema de Gestión de Taller Mecánico

-- =============================================
-- TABLAS PRINCIPALES
-- =============================================

-- Tabla de usuarios (ya existe, pero la mejoramos)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    telefono VARCHAR(20),
    usuario VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('cliente', 'mecanico', 'jefe_taller')),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de clientes (información adicional para usuarios con rol cliente)
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    direccion TEXT,
    fecha_nacimiento DATE,
    documento_identidad VARCHAR(20) UNIQUE,
    tipo_documento VARCHAR(10) DEFAULT 'CC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de vehículos
CREATE TABLE IF NOT EXISTS vehiculos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
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
);

-- Tabla de servicios (catálogo de servicios disponibles)
CREATE TABLE IF NOT EXISTS servicios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio_base DECIMAL(10,2) NOT NULL DEFAULT 0,
    duracion_estimada INTEGER DEFAULT 60, -- en minutos
    categoria VARCHAR(50), -- 'Mantenimiento', 'Reparación', 'Diagnóstico', etc.
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de citas/servicios programados
CREATE TABLE IF NOT EXISTS citas (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
    vehiculo_id INTEGER REFERENCES vehiculos(id) ON DELETE CASCADE,
    servicio_id INTEGER REFERENCES servicios(id),
    mecanico_id INTEGER REFERENCES usuarios(id), -- usuario con rol mecanico
    fecha_cita DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME,
    estado VARCHAR(20) DEFAULT 'Programada' CHECK (estado IN ('Programada', 'En Proceso', 'Completada', 'Cancelada', 'Reprogramada')),
    observaciones TEXT,
    diagnostico TEXT,
    costo_total DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de inventario (ya existe, pero la expandimos)
CREATE TABLE IF NOT EXISTS inventario (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    cantidad INTEGER NOT NULL DEFAULT 0,
    cantidad_minima INTEGER DEFAULT 5,
    precio_compra DECIMAL(10,2) DEFAULT 0,
    precio_venta DECIMAL(10,2) DEFAULT 0,
    categoria VARCHAR(50), -- 'Repuestos', 'Lubricantes', 'Herramientas', etc.
    codigo_barras VARCHAR(50),
    proveedor VARCHAR(100),
    ubicacion VARCHAR(50), -- 'Estante A1', 'Bodega 2', etc.
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de repuestos utilizados en servicios
CREATE TABLE IF NOT EXISTS repuestos_utilizados (
    id SERIAL PRIMARY KEY,
    cita_id INTEGER REFERENCES citas(id) ON DELETE CASCADE,
    inventario_id INTEGER REFERENCES inventario(id),
    cantidad_utilizada INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de facturas
CREATE TABLE IF NOT EXISTS facturas (
    id SERIAL PRIMARY KEY,
    numero_factura VARCHAR(20) UNIQUE NOT NULL,
    cita_id INTEGER REFERENCES citas(id),
    cliente_id INTEGER REFERENCES clientes(id),
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    descuento DECIMAL(10,2) DEFAULT 0,
    impuestos DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Pagada', 'Vencida', 'Cancelada')),
    fecha_emision DATE DEFAULT CURRENT_DATE,
    fecha_vencimiento DATE,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS pagos (
    id SERIAL PRIMARY KEY,
    factura_id INTEGER REFERENCES facturas(id) ON DELETE CASCADE,
    monto DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(20) NOT NULL CHECK (metodo_pago IN ('Efectivo', 'Tarjeta', 'Transferencia', 'Cheque')),
    numero_transaccion VARCHAR(50),
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de historial de mantenimiento
CREATE TABLE IF NOT EXISTS historial_mantenimiento (
    id SERIAL PRIMARY KEY,
    vehiculo_id INTEGER REFERENCES vehiculos(id) ON DELETE CASCADE,
    cita_id INTEGER REFERENCES citas(id),
    tipo_mantenimiento VARCHAR(50), -- 'Preventivo', 'Correctivo', 'Predictivo'
    descripcion TEXT NOT NULL,
    kilometraje_actual INTEGER,
    proximo_mantenimiento_km INTEGER,
    proximo_mantenimiento_fecha DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =============================================

CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);
CREATE INDEX IF NOT EXISTS idx_vehiculos_cliente ON vehiculos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_vehiculos_placa ON vehiculos(placa);
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha_cita);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);
CREATE INDEX IF NOT EXISTS idx_citas_mecanico ON citas(mecanico_id);
CREATE INDEX IF NOT EXISTS idx_facturas_estado ON facturas(estado);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha ON facturas(fecha_emision);
CREATE INDEX IF NOT EXISTS idx_inventario_categoria ON inventario(categoria);
CREATE INDEX IF NOT EXISTS idx_inventario_activo ON inventario(activo);

-- =============================================
-- TRIGGERS PARA UPDATED_AT
-- =============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para todas las tablas con updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehiculos_updated_at BEFORE UPDATE ON vehiculos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_servicios_updated_at BEFORE UPDATE ON servicios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_citas_updated_at BEFORE UPDATE ON citas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventario_updated_at BEFORE UPDATE ON inventario FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_facturas_updated_at BEFORE UPDATE ON facturas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- VISTAS ÚTILES
-- =============================================

-- Vista para información completa de citas
CREATE OR REPLACE VIEW vista_citas_completa AS
SELECT 
    c.id,
    c.fecha_cita,
    c.hora_inicio,
    c.hora_fin,
    c.estado,
    c.costo_total,
    c.observaciones,
    c.diagnostico,
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
LEFT JOIN usuarios m ON c.mecanico_id = m.id;

-- Vista para inventario con alertas de stock bajo
CREATE OR REPLACE VIEW vista_inventario_alerta AS
SELECT 
    *,
    CASE 
        WHEN cantidad <= cantidad_minima THEN 'Stock Bajo'
        WHEN cantidad = 0 THEN 'Sin Stock'
        ELSE 'Stock Normal'
    END as estado_stock
FROM inventario
WHERE activo = true;

-- Vista para estadísticas de servicios por mecánico
CREATE OR REPLACE VIEW vista_estadisticas_mecanico AS
SELECT 
    m.id as mecanico_id,
    m.nombre as mecanico_nombre,
    COUNT(c.id) as total_servicios,
    COUNT(CASE WHEN c.estado = 'Completada' THEN 1 END) as servicios_completados,
    COUNT(CASE WHEN c.estado = 'En Proceso' THEN 1 END) as servicios_en_proceso,
    COUNT(CASE WHEN c.estado = 'Programada' THEN 1 END) as servicios_programados,
    COALESCE(SUM(c.costo_total), 0) as ingresos_generados
FROM usuarios m
LEFT JOIN citas c ON m.id = c.mecanico_id
WHERE m.rol = 'mecanico' AND m.activo = true
GROUP BY m.id, m.nombre;
