const { Pool } = require('pg');
const logger = require('../utils/logger');

// Determine if SSL is required (Neon, Supabase, and most cloud DBs require it)
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
        rejectUnauthorized: false, // Neon uses valid certificates; false avoids CA bundle issues
      }
    : false,
});

pool.on('error', (err) => {
  logger.error('Unexpected database error:', err);
});

async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development' && duration > 1000) {
      logger.warn(`Slow query (${duration}ms):`, text);
    }
    return result;
  } catch (err) {
    logger.error('Database query error:', { text, error: err.message });
    throw err;
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