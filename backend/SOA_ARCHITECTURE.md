# Arquitectura SOA del backend

| Servicio | Responsabilidad | Prefijos canónicos | Dependencias clave |
|----------|-----------------|--------------------|--------------------|
| **Identity** | Registro, autenticación y emisión de JWT | `/identity`, alias `/usuarios` | Tabla `usuarios`, módulo `security` |
| **Usuarios** | Gestión de usuarios (datos de perfil) | `/usuarios` | Identity (para credenciales), tabla `usuarios` |
| **Vehículos** | Alta, consulta y baja lógica de vehículos | `/vehiculos` | Servicios `usuarios` y `historial` (consulta), tabla `vehiculos` |
| **Agenda** | Orquestación de citas y catálogo de servicios | `/agenda/citas`, `/agenda/servicios`, alias `/citas`, `/servicios` | Servicios `identity` (roles), tabla `citas`, tabla `servicios` |
| **Historial / Órdenes** | Registro de mantenimientos y diagnósticos | `/historial` | Tabla `historial_mantenimiento`, datos de `citas` |
| **Inventario** | Control de repuestos y consumos | `/inventario` | Tabla `inventario` |

## Organización del código

- Cada servicio vive en `backend/services/<servicio>` con la siguiente estructura:
  - `repository.js`: acceso a datos.
  - `service.js`: reglas de negocio y validaciones.
  - `router.js`: endpoints Express protegidos con JWT cuando corresponde.
  - `index.js`: definición del prefijo y alias de montaje.
- Los helpers compartidos (`shared/security.js`, `utils/serviceError.js`) evitan duplicar lógica transversal.
- `backend/services/index.js` expone la lista de servicios para que `backend/index.js` registre los routers automáticamente.

## Evaluación de la separación

- **Identity** está completamente aislado y sólo expone operaciones de autenticación. Otros servicios consumen funciones comunes de `shared/security`, evitando dependencias directas.
- **Clientes** reutiliza la tabla `usuarios` sin duplicar datos ni crear joins innecesarios. Si se requieren perfiles adicionales por rol, se sugiere extender el repositorio con nuevas columnas o vistas en lugar de nuevas tablas.
- **Vehículos** delega la generación del historial al servicio `historial`. La ruta heredada `/vehiculos/:id/historial` reusa la lógica del servicio especializado para mantener compatibilidad sin romper la separación.
- **Agenda** agrupa tanto la programación de citas como el catálogo de servicios, reduciendo pasos cuando se necesitan ambos conceptos de forma coordinada (por ejemplo, calcular `hora_fin` a partir de la duración del servicio).
- **Historial** funciona como servicio auxiliar que puede evolucionar a órdenes de trabajo completas (p.ej., agregando estados, responsables y costos). Hoy sólo depende de `citas` para enriquecer la información.
- **Inventario** permanece totalmente independiente; en una siguiente iteración se podrían exponer eventos de consumo ligados a `historial` o `agenda` usando colas o webhooks.


