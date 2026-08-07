# AccessMitra

A community-verified, AI-assisted accessibility navigator — Stage 2 prototype for
PS-16 "A City Full of Barriers" (Accessibility & Inclusion), Project Viksit Bharat 2026.

Everything for this submission lives in this one folder:

```
accessmitra/
├── demo/          Zero-install interactive demo (open index.html in any browser)
├── mobile/        Real React Native (Expo) app — the production client
├── backend/       Node.js + Express REST API + PostgreSQL/PostGIS
├── docker-compose.yml   One command to run backend + database together
└── docs/          Architecture notes
```

## Quick start (three ways, pick one)

### 1. Instant demo — no install, no backend
Open `demo/index.html` directly in a browser. Every screen (search, step-free
routing, report-a-barrier, community verification, high-contrast mode) is fully
interactive using in-memory mock data. This is what to open first when you just
want to click through the product.

### 2. Full stack with Docker (recommended for judges)
```bash
docker compose up --build
```
This starts a real PostgreSQL 16 + PostGIS database (seeded from
`backend/src/db/schema.sql`) and the Express API on `http://localhost:4000`.
Then seed demo data:
```bash
docker compose exec api npm run seed
```
Verify it's alive:
```bash
curl http://localhost:4000/api/health
curl http://localhost:4000/api/places
```

### 3. Run the real mobile app against the API
```bash
cd backend && npm install && cp .env.example .env && npm run seed && npm run dev
# in a second terminal
cd mobile && npm install && npm run web    # or: npm run android / npm run ios
```
`npm run web` runs the exact same React Native codebase in a browser via
react-native-web — no simulator required to try it. `npm run android` /
`npm run ios` need Expo Go or a simulator installed locally.

## Why both a demo/ and a mobile/ app?

`mobile/` is the real product: React Native + Expo, calling the real Express
API, matching the architecture in the Stage 1 deck. It needs `npm install`
to run, like any real app.

`demo/` is a single self-contained HTML file with the same UX and the same
mock data, so anyone (including judges without a dev environment set up) can
try the product logic in one click. It talks to no backend — it's a UX/interaction
reference, not the deliverable architecture.

See `docs/PROJECT_DOCUMENTATION.pdf` for full technical documentation:
setup, architecture, API reference, database schema, and known limitations.
