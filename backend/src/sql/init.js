const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function init() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(sql);
  console.log('✓ Schema applied successfully');
  await pool.end();
}

init().catch((err) => {
  console.error('Schema init failed:', err.message);
  process.exit(1);
});
