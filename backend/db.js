const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '290412',
  database: process.env.DB_NAME || 'gti_ltda',
  max: 20, // máximo de conexiones en el pool
  idleTimeoutMillis: 30000, // tiempo antes de cerrar conexiones inactivas
  connectionTimeoutMillis: 2000, // tiempo máximo para obtener conexión
});

// Función helper para ejecutar queries (similar a mysql2)
pool.query = (async (text, params) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return [result.rows, result]; // Mantener compatibilidad con mysql2
  } finally {
    client.release();
  }
});

module.exports = pool;