const pool = require('../db/pool');

/**
 * GET /api/places?lat=&lng=&radiusM=&category=&need=
 * Uses PostGIS ST_DWithin/ST_Distance for real great-circle
 * radius search and distance sorting.
 */
async function listPlaces(req, res, next) {
  try {
    const {
      lat, lng,
      radiusM = 5000,
      category,
      need, // 'wheelchair' | 'visual' | 'hearing' | 'elderly'
      search,
    } = req.query;

    const hasLocation = lat && lng;
    const params = [];
    const where = [];

    let distanceSelect = 'NULL AS distance_m';
    let orderBy = 'p.name ASC';

    if (hasLocation) {
      params.push(Number(lng), Number(lat));
      distanceSelect = `ST_Distance(location, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography) AS distance_m`;
      orderBy = 'distance_m ASC';
      params.push(Number(radiusM));
      where.push(`ST_DWithin(location, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography, $${params.length})`);
    }

    if (category && category !== 'All') {
      params.push(category);
      where.push(`category = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      where.push(`name ILIKE $${params.length}`);
    }

    const needFeatureMap = { wheelchair: 'ramp', visual: 'audio', hearing: 'audio', elderly: 'ramp' };
    if (need && needFeatureMap[need]) {
      where.push(`(features->>'${needFeatureMap[need]}')::boolean IS TRUE`);
    }

    const sql = `
      SELECT p.id, p.name, p.category, p.address, p.rating, p.verified_count, p.features,
             ${distanceSelect}
      FROM places p
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY ${orderBy}
      LIMIT 50;
    `;

    const { rows } = await pool.query(sql, params);
    res.json({ results: rows });
  } catch (err) {
    next(err);
  }
}

async function getPlace(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT * FROM places WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Place not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { listPlaces, getPlace };
