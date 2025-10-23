# Documentación de la API - GTI LTDA

## Base URL
```
http://localhost:3001/api
```

La arquitectura está organizada en servicios independientes (SOA). Cada servicio expone un prefijo canónico bajo `/api/<servicio>/...`. Se mantienen alias históricos para no romper integraciones previas (por ejemplo, `/api/citas` sigue disponible además de `/api/agenda/citas`).

> **Autenticación:** Todos los endpoints requieren un token JWT en el encabezado `Authorization: Bearer <token>` salvo los de `identity` (`/identity/login` y `/identity/register`).

## Servicios disponibles

### 🔐 Identity & Access (`/identity`)

- `POST /identity/register` – registrar usuarios de cualquier rol.
- `POST /identity/login` – autenticar usuarios y obtener un JWT.

_Alias legado_: `/usuarios/register`, `/usuarios/login`.

### 👥 Clientes (`/clientes`)

- `GET /clientes` – listar clientes activos con conteo de vehículos asociados.
- `GET /clientes/:id` – obtener los datos de un cliente.
- `POST /clientes` – crear un cliente (se almacena en `usuarios` con rol `cliente`).
- `PUT /clientes/:id` – actualizar datos del cliente.
- `DELETE /clientes/:id` – desactivar (soft delete) un cliente.

### 🚗 Vehículos (`/vehiculos`)

- `GET /vehiculos` – listar vehículos con información del cliente.
- `GET /vehiculos/:id` – obtener un vehículo específico.
- `GET /vehiculos/cliente/:clienteId` – vehículos de un cliente.
- `GET /vehiculos/:id/historial` – historial de mantenimiento (delegado al servicio `historial`).
- `POST /vehiculos` – crear vehículo.
- `PUT /vehiculos/:id` – actualizar vehículo.
- `DELETE /vehiculos/:id` – baja lógica del vehículo.

### 🗓️ Agenda (`/agenda`)

#### Citas (`/agenda/citas`)
- `GET /agenda/citas` – todas las citas con información contextual.
- `GET /agenda/citas/fecha/:fecha` – citas por fecha (`YYYY-MM-DD`).
- `GET /agenda/citas/mecanico/:mecanicoId` – agenda por mecánico.
- `GET /agenda/citas/:id` – detalle de una cita.
- `POST /agenda/citas` – crear cita (calcula automáticamente `hora_fin` a partir del servicio).
- `PUT /agenda/citas/:id` – actualizar cita (recalcula duración según el servicio asociado).
- `PATCH /agenda/citas/:id/cancelar` – marcar cita como cancelada (opcionalmente adjunta observaciones).

#### Catálogo de servicios (`/agenda/servicios`)
- `GET /agenda/servicios` – listar servicios activos.
- `GET /agenda/servicios/:id` – detalle de un servicio.
- `GET /agenda/servicios/categoria/:categoria` – servicios por categoría.
- `GET /agenda/servicios/categorias/list` – categorías disponibles
- `POST /agenda/servicios` – crear servicio del catálogo.
- `PUT /agenda/servicios/:id` – actualizar servicio.
- `DELETE /agenda/servicios/:id` – baja lógica del servicio.

_Alias legado_: `/citas`, `/servicios`.

### 📘 Historial / Órdenes de trabajo (`/historial`)

- `GET /historial/vehiculo/:vehiculoId` – historial de mantenimiento de un vehículo.
- `POST /historial/vehiculo/:vehiculoId` – registrar una nueva entrada de historial (diagnóstico/orden de trabajo).

### 🧰 Inventario (`/inventario`)

- `GET /inventario` – listar existencias completas.
- `POST /inventario` – crear ítem.
- `PUT /inventario/:id` – actualizar ítem.
- `DELETE /inventario/:id` – eliminar ítem del inventario.

## Consideraciones generales

- Los servicios reutilizan la tabla `usuarios` para roles y autenticación.
- Las respuestas de error están unificadas mediante `ServiceError` (`{ error, details? }`).
- Se recomienda propagar siempre el token JWT obtenido en `identity/login` para acceder al resto de servicios.
