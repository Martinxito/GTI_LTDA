require('dotenv').config();

const config = {
  server: {
    port: parseInt(process.env.PORT, 10) || 3001
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'mi_super_clave_secreta_2025_gti_ltda',
    tokenExpiry: process.env.JWT_EXPIRY || '8h'
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '290412',
    database: process.env.DB_NAME || 'gti_ltda',
    max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT, 10) || 30000,
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT, 10) || 2000
  }
};

module.exports = config;
