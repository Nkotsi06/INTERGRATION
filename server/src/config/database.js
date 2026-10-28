const { Pool } = require('pg');
const logger = require('../utils/logger');

// Determine if SSL is required. Supabase requires SSL.
// Production is assumed to require SSL as well.
const useSSL = process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: useSSL
    ? {
        rejectUnauthorized: false, // Supabase uses valid certificates; false avoids CA bundle issues
      }
    : false,
  // Render does not support outbound IPv6. Supabase's pooler hostname
  // resolves to both IPv4 and IPv6. Forcing family 4 guarantees the
  // connection uses IPv4 and avoids ENETUNREACH.
  family: 4,
});

pool.on('error', (err) => {
  logger.error('Unexpected database pool error:', {
    code: err.code || null,
    message: err.message,
  });
});

function isConnectionTerminated(err) {
  return [
    '08000',
    '08003',
    '08006',
    '57P01',
    '57P02',
    '57P03',
    'ECONNRESET',
    'EPIPE',
    'ETIMEDOUT',
  ].includes(err.code) || /connection terminated|socket hang up/i.test(err.message || '');
}

async function query(text, params) {
  const start = Date.now();
  const readOnly = /^\s*(SELECT|SHOW|EXPLAIN)\b/i.test(text);
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const result = await pool.query(text, params);
      const duration = Date.now() - start;
      if (process.env.NODE_ENV === 'development' && duration > 1000) {
        logger.warn(`Slow query (${duration}ms):`, text);
      }
      return result;
    } catch (err) {
      if (attempt === 0 && readOnly && isConnectionTerminated(err)) {
        logger.warn('Retrying read-only query after terminated database connection', {
          code: err.code || null,
        });
        continue;
      }
      logger.error('Database query error:', { text, error: err.message });
      throw err;
    }
  }
}

async function getClient() {
  return pool.connect();
}

async function testConnection() {
  const client = await pool.connect();
  try {
    await client.query('SELECT NOW()');
  } finally {
    client.release();
  }
}

module.exports = { query, getClient, testConnection, pool };