# Documentación de la API - GTI LTDA

## Base URL
```
http://localhost:3001/api
```

## Autenticación
Todas las rutas (excepto login y register) requieren un token JWT en el header:
```
Authorization: Bearer <token>
```

## Endpoints Disponibles

### 🔐 Autenticación

#### POST `/usuarios/login`
Iniciar sesión
```json
{
  "usuario": "admin",
  "password": "admin123"
}
```

#### POST `/usuarios/register`
Registrar nuevo usuario
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@email.com",
  "telefono": "3001234567",
  "usuario": "juan",
  "password": "password123",
  "rol": "cliente"
}
```

### 👥 Clientes

#### GET `/clientes`
Obtener todos los clientes

#### GET `/clientes/:id`
Obtener cliente por ID

#### POST `/clientes`
Crear nuevo cliente
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@email.com",
  "telefono": "3001234567",
  "direccion": "Calle 123 #45-67",
  "fecha_nacimiento": "1990-01-01",
  "documento_identidad": "12345678",
  "tipo_documento": "CC",
  "password": "password123"
}
```

#### PUT `/clientes/:id`
Actualizar cliente

#### DELETE `/clientes/:id`
Eliminar cliente (soft delete)

#### GET `/clientes/:id/vehiculos`
Obtener vehículos de un cliente

#### GET `/clientes/:id/citas`
Obtener citas de un cliente

#### GET `/clientes/buscar/:termino`
Buscar clientes por nombre, apellido, documento o email

### 🚗 Vehículos

#### GET `/vehiculos`
Obtener todos los vehículos

#### GET `/vehiculos/:id`
Obtener vehículo por ID

#### POST `/vehiculos`
Crear nuevo vehículo
```json
{
  "cliente_id": 1,
  "marca": "Toyota",
  "modelo": "Corolla",
  "año": 2020,
  "placa": "ABC123",
  "color": "Blanco",
  "kilometraje": 45000,
  "tipo_combustible": "Gasolina",
  "numero_motor": "123456789",
  "numero_chasis": "987654321",
  "observaciones": "Vehículo en buen estado"
}
```

#### PUT `/vehiculos/:id`
Actualizar vehículo

#### DELETE `/vehiculos/:id`
Eliminar vehículo (soft delete)

#### GET `/vehiculos/cliente/:clienteId`
Obtener vehículos de un cliente específico

#### GET `/vehiculos/:id/historial`
Obtener historial de mantenimiento de un vehículo

### 🔧 Servicios

#### GET `/servicios`
Obtener todos los servicios

#### GET `/servicios/:id`
Obtener servicio por ID

#### POST `/servicios`
Crear nuevo servicio
```json
{
  "nombre": "Cambio de aceite",
  "descripcion": "Cambio de aceite y filtro",
  "precio_base": 45000,
  "duracion_estimada": 30,
  "categoria": "Mantenimiento"
}
```

#### PUT `/servicios/:id`
Actualizar servicio

#### DELETE `/servicios/:id`
Eliminar servicio (soft delete)

#### GET `/servicios/categoria/:categoria`
Obtener servicios por categoría

#### GET `/servicios/categorias/list`
Obtener lista de categorías

### 📅 Citas

#### GET `/citas`
Obtener todas las citas

#### GET `/citas/:id`
Obtener cita por ID

#### POST `/citas`
Crear nueva cita
```json
{
  "cliente_id": 1,
  "vehiculo_id": 1,
  "servicio_id": 1,
  "mecanico_id": 2,
  "fecha_cita": "2025-01-20",
  "hora_inicio": "10:00",
  "observaciones": "Cliente solicita revisión completa"
}
```

#### PUT `/citas/:id`
Actualizar cita

#### PATCH `/citas/:id/estado`
Actualizar estado de cita
```json
{
  "estado": "Completada",
  "diagnostico": "Servicio completado exitosamente"
}
```

#### DELETE `/citas/:id`
Eliminar cita

#### GET `/citas/fecha/:fecha`
Obtener citas por fecha

#### GET `/citas/mecanico/:mecanicoId`
Obtener citas de un mecánico

#### GET `/citas/estadisticas/resumen`
Obtener estadísticas de citas

### 📦 Inventario

#### GET `/inventario`
Obtener todo el inventario

#### POST `/inventario`
Crear nuevo repuesto
```json
{
  "nombre": "Filtro de aceite",
  "descripcion": "Filtro de aceite para motor",
  "cantidad": 25,
  "cantidad_minima": 5,
  "precio_compra": 15000,
  "precio_venta": 25000,
  "categoria": "Repuestos",
  "proveedor": "Repuestos ABC",
  "ubicacion": "Estante A1"
}
```

#### PUT `/inventario/:id`
Actualizar repuesto

#### DELETE `/inventario/:id`
Eliminar repuesto

## Estados de Respuesta

### Códigos de Estado HTTP
- `200` - OK
- `201` - Creado
- `400` - Error en la solicitud
- `401` - No autorizado
- `404` - No encontrado
- `500` - Error del servidor

### Formato de Respuesta de Error
```json
{
  "error": "Mensaje de error descriptivo"
}
```

### Formato de Respuesta de Éxito
```json
{
  "mensaje": "Operación exitosa",
  "data": { ... }
}
```

## Ejemplos de Uso

### Flujo Completo de una Cita

1. **Crear Cliente**
```bash
POST /api/clientes
```

2. **Crear Vehículo**
```bash
POST /api/vehiculos
```

3. **Crear Cita**
```bash
POST /api/citas
```

4. **Actualizar Estado de Cita**
```bash
PATCH /api/citas/:id/estado
```

### Búsqueda de Clientes
```bash
GET /api/clientes/buscar/juan
```

### Obtener Citas del Día
```bash
GET /api/citas/fecha/2025-01-20
```

## Notas Importantes

- Todas las fechas deben estar en formato ISO (YYYY-MM-DD)
- Las horas deben estar en formato 24h (HH:MM)
- Los precios se manejan en centavos (ej: 45000 = $45,000)
- Los soft deletes marcan registros como inactivos, no los eliminan físicamente
- Los tokens JWT expiran en 8 horas
