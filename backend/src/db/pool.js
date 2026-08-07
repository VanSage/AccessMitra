const { Pool } = require('pg');

// DATABASE_URL example:
// postgresql://accessmitra:accessmitra@localhost:5432/accessmitra
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle Postgres client', err);
  process.exit(1);
});

module.exports = pool;
