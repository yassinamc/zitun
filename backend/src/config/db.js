const { Pool } = require('pg');
require('dotenv').config();

const isRemote = Boolean(
  process.env.DATABASE_URL &&
  (process.env.DATABASE_URL.includes('neon.tech') ||
   process.env.DATABASE_URL.includes('sslmode=require') ||
   process.env.NODE_ENV === 'production')
);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isRemote ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error', err);
});

async function query(text, params) {
  return pool.query(text, params);
}

async function getClient() {
  return pool.connect();
}

async function checkConnection() {
  const result = await pool.query('SELECT NOW() AS now');
  return result.rows[0].now;
}

module.exports = { pool, query, getClient, checkConnection };
