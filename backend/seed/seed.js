/**
 * Seeds the database with demo places, a demo user, and a couple of
 * barrier reports so the API returns something meaningful right away.
 *
 * Usage:  npm run seed   (see package.json)
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../src/db/pool');

const PLACES = [
  { name: 'Sector 17 Metro Station', category: 'Transit', lng: 76.7794, lat: 30.7410,
    features: { ramp: true, restroom: true, elevator: true, parking: false, audio: true }, rating: 4.6, verified_count: 128 },
  { name: 'Elante Mall', category: 'Shopping', lng: 76.8080, lat: 30.7046,
    features: { ramp: true, restroom: true, elevator: true, parking: true, audio: false }, rating: 4.8, verified_count: 212 },
  { name: 'Central Public Library', category: 'Education', lng: 76.7683, lat: 30.7333,
    features: { ramp: true, restroom: false, elevator: true, parking: false, audio: false }, rating: 4.2, verified_count: 64 },
  { name: 'Green Leaf Café', category: 'Food', lng: 76.7820, lat: 30.7455,
    features: { ramp: false, restroom: false, elevator: false, parking: false, audio: false }, rating: 4.0, verified_count: 31 },
  { name: 'Rock Garden Park', category: 'Park', lng: 76.8060, lat: 30.7520,
    features: { ramp: true, restroom: true, elevator: false, parking: true, audio: true }, rating: 4.9, verified_count: 340 },
  { name: 'Sector 32 Civil Hospital', category: 'Health', lng: 76.7690, lat: 30.7280,
    features: { ramp: true, restroom: true, elevator: true, parking: true, audio: true }, rating: 4.5, verified_count: 98 },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Demo user (password: "password123") so reports/upvotes have an author
    const passwordHash = await bcrypt.hash('password123', 10);
    const userRes = await client.query(
      `INSERT INTO users (name, email, password_hash, accessibility_need)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      ['Demo Volunteer', 'demo@accessmitra.app', passwordHash, 'wheelchair']
    );
    const userId = userRes.rows[0].id;

    const placeIds = [];
    for (const p of PLACES) {
      const res = await client.query(
        `INSERT INTO places (name, category, location, features, rating, verified_count)
         VALUES ($1,$2, ST_SetSRID(ST_MakePoint($3,$4),4326)::geography, $5,$6,$7)
         RETURNING id`,
        [p.name, p.category, p.lng, p.lat, p.features, p.rating, p.verified_count]
      );
      placeIds.push(res.rows[0].id);
    }

    await client.query(
      `INSERT INTO reports (place_id, reporter_id, category, description, status, upvotes)
       VALUES
        ($1, $2, 'Broken Ramp', 'Ramp near Gate 3 is blocked by a construction barrier.', 'pending', 2),
        ($3, $2, 'Missing Signage', 'No accessible-restroom signage on the 2nd floor food court.', 'verified', 4),
        ($4, $2, 'No Restroom Access', 'Accessible restroom was locked, no staff nearby with a key.', 'pending', 1)`,
      [placeIds[0], userId, placeIds[1], placeIds[2]]
    );

    await client.query('COMMIT');
    console.log(`Seeded ${PLACES.length} places, 1 user, 3 reports.`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
