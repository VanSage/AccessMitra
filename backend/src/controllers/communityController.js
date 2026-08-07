const pool = require('../db/pool');

async function leaderboard(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT name, trust_points AS points,
              CASE
                WHEN trust_points >= 1000 THEN 'Gold Verifier'
                WHEN trust_points >= 500  THEN 'Silver Verifier'
                ELSE 'New Contributor'
              END AS badge
       FROM users
       ORDER BY trust_points DESC
       LIMIT 20`
    );
    res.json({ results: rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { leaderboard };
