# Guía de Migración a PostgreSQL

## Pasos para migrar de MySQL a PostgreSQL

### 1. Instalar PostgreSQL
- Descarga e instala PostgreSQL desde: https://www.postgresql.org/download/
- Durante la instalación, recuerda la contraseña que configures para el usuario `postgres`
- 

### 2. Crear la base de datos
```sql
-- Conectarse a PostgreSQL como superusuario
psql -U postgres

-- Crear la base de datos
CREATE DATABASE gti_ltda;

-- Crear un usuario específico (opcional)
CREATE USER gti_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE gti_ltda TO gti_user;
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en el directorio `backend/` con el siguiente contenido:

```env
# Configuración de PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password_aqui
DB_NAME=gti_ltda

# JWT Secret
JWT_SECRET=mi_super_clave_secreta_2025_gti_ltda

# Puerto del servidor
PORT=3001
```

**⚠️ IMPORTANTE:** Cambia `tu_password_aqui` por tu contraseña real de PostgreSQL.

### 4. Instalar dependencias
```bash
cd backend
npm install
```

### 5. Ejecutar la migración
```bash
npm run migrate
```

Este comando creará las tablas necesarias y algunos datos de ejemplo.

### 6. Iniciar el servidor
```bash
npm start
```

## Cambios realizados en la migración

### Dependencias actualizadas:
- ❌ Removido: `mysql2`
- ✅ Agregado: `pg` (cliente PostgreSQL)
- ✅ Agregado: `dotenv` (variables de entorno)

### Cambios en el código:
1. **db.js**: Configuración de pool de conexiones PostgreSQL
2. **Queries SQL**: Cambio de `?` a `$1, $2, $3...` (sintaxis PostgreSQL)
3. **INSERT con RETURNING**: Para obtener el ID del registro insertado
4. **Variables de entorno**: Configuración centralizada en `.env`

### Estructura de tablas creadas:

#### Tabla `usuarios`:
- `id` (SERIAL PRIMARY KEY)
- `nombre` (VARCHAR)
- `usuario` (VARCHAR UNIQUE)
- `password` (VARCHAR)
- `rol` (VARCHAR con CHECK constraint)
- `created_at` (TIMESTAMP)

#### Tabla `inventario`:
- `id` (SERIAL PRIMARY KEY)
- `nombre` (VARCHAR)
- `cantidad` (INTEGER)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP con trigger automático)

## Usuario por defecto creado:
- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Rol**: `jefe_taller`

## Verificación
Para verificar que todo funciona correctamente:

1. El servidor debe iniciar sin errores
2. Puedes hacer login con el usuario `admin`
3. Las operaciones CRUD del inventario deben funcionar
4. Revisa los logs del servidor para confirmar la conexión a PostgreSQL

## Solución de problemas

### Error de conexión:
- Verifica que PostgreSQL esté ejecutándose
- Confirma las credenciales en el archivo `.env`
- Asegúrate de que la base de datos `gti_ltda` existe

### Error de permisos:
- Verifica que el usuario tenga permisos en la base de datos
- Si usas un usuario específico, asegúrate de que tenga los privilegios necesarios

### Error de puerto:
- PostgreSQL usa el puerto 5432 por defecto
- Verifica que no haya conflictos de puertos
