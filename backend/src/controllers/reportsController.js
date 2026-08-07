const pool = require('../db/pool');
const { verifyReportPhoto } = require('../services/aiVerificationService');
const { notifyReportVerified } = require('../services/notificationService');

const VERIFY_THRESHOLD = 3; // upvotes needed to flip a report to "verified"

// Maps a verified report category to the place.features flag it should flip off
const FEATURE_BY_CATEGORY = {
  'Broken Ramp': 'ramp',
  'Broken Elevator': 'elevator',
  'No Restroom Access': 'restroom',
};

async function listReports(req, res, next) {
  try {
    const { status, placeId } = req.query;
    const where = [];
    const params = [];

    if (status) { params.push(status); where.push(`r.status = $${params.length}`); }
    if (placeId) { params.push(placeId); where.push(`r.place_id = $${params.length}`); }

    const { rows } = await pool.query(
      `SELECT r.*, p.name AS place_name
       FROM reports r JOIN places p ON p.id = r.place_id
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ORDER BY r.created_at DESC
       LIMIT 100`,
      params
    );
    res.json({ results: rows });
  } catch (err) {
    next(err);
  }
}

async function createReport(req, res, next) {
  try {
    const { placeId, category, description, photoUrl } = req.body;
    if (!placeId || !category) {
      return res.status(400).json({ error: 'placeId and category are required' });
    }

    const aiResult = await verifyReportPhoto({ photoUrl, category });

    const { rows } = await pool.query(
      `INSERT INTO reports (place_id, reporter_id, category, description, photo_url, status, upvotes)
       VALUES ($1,$2,$3,$4,$5,'pending',0)
       RETURNING *`,
      [placeId, req.user ? req.user.id : null, category, description || null, photoUrl || null]
    );

    res.status(201).json({ report: rows[0], aiPreScreen: aiResult });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/reports/:id/upvote
 * Records one confirmation from the current user (or an anonymous
 * demo user if unauthenticated) and flips the report to "verified"
 * once VERIFY_THRESHOLD is reached — updating the place's live
 * accessibility badges in the same transaction.
 */
async function upvoteReport(req, res, next) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const reportRes = await client.query('SELECT * FROM reports WHERE id = $1 FOR UPDATE', [req.params.id]);
    if (!reportRes.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Report not found' });
    }
    const report = reportRes.rows[0];
    if (report.status === 'verified') {
      await client.query('ROLLBACK');
      return res.json({ report, alreadyVerified: true });
    }

    const newUpvotes = report.upvotes + 1;
    const willVerify = newUpvotes >= VERIFY_THRESHOLD;

    const updateRes = await client.query(
      `UPDATE reports SET upvotes = $1, status = $2 WHERE id = $3 RETURNING *`,
      [newUpvotes, willVerify ? 'verified' : 'pending', report.id]
    );
    const updatedReport = updateRes.rows[0];

    if (willVerify) {
      const flagKey = FEATURE_BY_CATEGORY[report.category];
      if (flagKey) {
        await client.query(
          `UPDATE places SET features = jsonb_set(features, $1, 'false'::jsonb) WHERE id = $2`,
          [`{${flagKey}}`, report.place_id]
        );
      }
      await client.query('UPDATE places SET verified_count = verified_count + 1 WHERE id = $1', [report.place_id]);

      if (req.user) {
        await client.query('UPDATE users SET trust_points = trust_points + 25 WHERE id = $1', [req.user.id]);
      }
    }

    await client.query('COMMIT');

    if (willVerify) {
      const placeRes = await pool.query('SELECT name FROM places WHERE id = $1', [report.place_id]);
      await notifyReportVerified({
        userId: report.reporter_id,
        placeName: placeRes.rows[0]?.name,
        category: report.category,
      });
    }

    res.json({ report: updatedReport, verifiedJustNow: willVerify });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

module.exports = { listReports, createReport, upvoteReport };
