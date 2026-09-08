const { Pool } = require('pg');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_z6s4RcYMWCeo@ep-steep-bird-ayg2o4xu-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const isRemote = Boolean(
  dbUrl &&
  (dbUrl.includes('neon.tech') ||
   dbUrl.includes('sslmode=require') ||
   process.env.NODE_ENV === 'production')
);

const pool = new Pool({
  connectionString: dbUrl,
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
