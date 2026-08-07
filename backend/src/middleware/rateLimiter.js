/**
 * Minimal fixed-window rate limiter (no external dependency).
 * Matches the "Rate Limiter" box in the architecture diagram.
 * For production scale this should move to a Redis-backed limiter
 * shared across server instances.
 */
function rateLimiter({ windowMs = 60_000, max = 120 } = {}) {
  const hits = new Map(); // ip -> { count, resetAt }

  return (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = hits.get(ip);

    if (!entry || now > entry.resetAt) {
      hits.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= max) {
      const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
      res.set('Retry-After', String(retryAfterSec));
      return res.status(429).json({ error: 'Too many requests, please slow down.', retryAfterSec });
    }

    entry.count += 1;
    next();
  };
}

module.exports = rateLimiter;
