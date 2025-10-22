const { Pool } = require('pg');
const config = require('./config');

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  max: config.db.max,
  idleTimeoutMillis: config.db.idleTimeoutMillis,
  connectionTimeoutMillis: config.db.connectionTimeoutMillis
});

pool.query = async (text, params) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return [result.rows, result];
  } finally {
    client.release();
  }
};

module.exports = pool;
