-- AccessMitra database schema
-- Requires PostgreSQL 14+ with the PostGIS extension.

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- for gen_random_uuid()

-- ---------------------------------------------------------------
-- USERS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  accessibility_need TEXT CHECK (accessibility_need IN ('wheelchair','visual','hearing','elderly') OR accessibility_need IS NULL),
  trust_points    INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------
-- PLACES  (location stored as a geography Point for accurate
-- great-circle distance / radius queries via PostGIS)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS places (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL CHECK (category IN ('Transit','Shopping','Food','Park','Education','Health','Other')),
  address         TEXT,
  location        GEOGRAPHY(POINT, 4326) NOT NULL,
  rating          NUMERIC(2,1) NOT NULL DEFAULT 0,
  verified_count  INTEGER NOT NULL DEFAULT 0,
  features        JSONB NOT NULL DEFAULT '{"ramp":false,"restroom":false,"elevator":false,"parking":false,"audio":false}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS places_location_gix ON places USING GIST (location);
CREATE INDEX IF NOT EXISTS places_category_idx ON places (category);

-- ---------------------------------------------------------------
-- BARRIER REPORTS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
  id              SERIAL PRIMARY KEY,
  place_id        INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  reporter_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  category        TEXT NOT NULL CHECK (category IN ('Broken Ramp','Blocked Path','No Restroom Access','Missing Signage','Broken Elevator','Other')),
  description     TEXT,
  photo_url       TEXT,               -- S3 object URL, populated by the upload service
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verified','rejected')),
  upvotes         INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reports_place_idx ON reports (place_id);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports (status);

-- Prevents the same user from upvoting/confirming a report twice
CREATE TABLE IF NOT EXISTS report_votes (
  report_id       INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (report_id, user_id)
);

-- ---------------------------------------------------------------
-- Example PostGIS spatial query used by GET /api/places
-- (kept here for reference — see src/controllers/placesController.js)
-- ---------------------------------------------------------------
-- SELECT p.*, ST_Distance(location, ST_MakePoint($1,$2)::geography) AS distance_m
-- FROM places p
-- WHERE ST_DWithin(location, ST_MakePoint($1,$2)::geography, $3)
-- ORDER BY distance_m ASC;
