require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const rateLimiter = require('./middleware/rateLimiter');
const placesRoutes = require('./routes/places');
const reportsRoutes = require('./routes/reports');
const routingRoutes = require('./routes/routes');
const communityRoutes = require('./routes/community');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 4000;

// ---- API Gateway layer ------------------------------------------
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(rateLimiter({ windowMs: 60_000, max: 120 })); // 120 req/min per IP

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'accessmitra-api' }));

// ---- Application services ----------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/routes', routingRoutes);
app.use('/api/community', communityRoutes);

app.use((req, res) => res.status(404).json({ error: `No route for ${req.method} ${req.path}` }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`AccessMitra API listening on http://localhost:${PORT}`);
});

module.exports = app;
