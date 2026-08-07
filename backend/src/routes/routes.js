const express = require('express');
const pool = require('../db/pool');
const { getStepFreeRoute } = require('../services/routingService');

const router = express.Router();

/**
 * GET /api/routes?placeId=&fromLat=&fromLng=
 * Returns a step-free route to the given place, automatically
 * factoring in the highest-upvoted *pending* barrier report for
 * that place (mirrors the "live reroute" moment in the demo).
 */
router.get('/', async (req, res, next) => {
  try {
    const { placeId, fromLat, fromLng } = req.query;
    if (!placeId) return res.status(400).json({ error: 'placeId is required' });

    const placeRes = await pool.query(
      `SELECT id, name, ST_Y(location::geometry) AS lat, ST_X(location::geometry) AS lng
       FROM places WHERE id = $1`,
      [placeId]
    );
    if (!placeRes.rows.length) return res.status(404).json({ error: 'Place not found' });
    const place = placeRes.rows[0];

    const barrierRes = await pool.query(
      `SELECT id, category FROM reports
       WHERE place_id = $1 AND status = 'pending'
       ORDER BY upvotes DESC LIMIT 1`,
      [placeId]
    );

    const route = await getStepFreeRoute({
      fromLat: Number(fromLat) || place.lat,
      fromLng: Number(fromLng) || place.lng,
      toLat: place.lat,
      toLng: place.lng,
      placeName: place.name,
      activeBarrier: barrierRes.rows[0] || null,
    });

    res.json(route);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
