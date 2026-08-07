const jwt = require('jsonwebtoken');

/**
 * Verifies the Bearer token on protected routes and attaches
 * the decoded payload to req.user. Matches the "Auth Service"
 * box in the architecture diagram.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me');
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Same as requireAuth but does not fail the request when no token
 * is present — used on routes that behave slightly differently for
 * logged-in users (e.g. personalised ranking) without requiring login.
 */
function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me');
    } catch (_err) {
      // ignore invalid token on optional routes
    }
  }
  next();
}

module.exports = { requireAuth, optionalAuth };
