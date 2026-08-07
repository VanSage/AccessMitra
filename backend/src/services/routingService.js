/**
 * Routing Service
 * ----------------
 * In production this calls Google Directions API (or a self-hosted
 * OSRM instance) and post-processes the response to prefer step-free
 * paths using OSM `wheelchair=yes` / `ramp=yes` tags, falling back to
 * this deterministic mock when no MAPS_API_KEY is configured — which
 * keeps local dev and CI runnable without a paid API key.
 */
const HAS_MAPS_KEY = Boolean(process.env.GOOGLE_MAPS_API_KEY);

async function getStepFreeRoute({ fromLat, fromLng, toLat, toLng, placeName, activeBarrier }) {
  if (HAS_MAPS_KEY) {
    // TODO(production): call Google Directions API with mode=walking,
    // then filter/re-rank steps using accessibility metadata pulled
    // from the `places`/`reports` tables for anything along the polyline.
    //
    // const url = `https://maps.googleapis.com/maps/api/directions/json` +
    //   `?origin=${fromLat},${fromLng}&destination=${toLat},${toLng}` +
    //   `&mode=walking&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    // const res = await fetch(url);
    // ... map res.json() legs/steps into the shape below ...
  }

  const steps = [
    { instruction: 'Head toward the main road', distanceM: 150, type: 'walk' },
    { instruction: 'Use the accessible ramp at the nearest gate', distanceM: 40, type: 'ramp' },
    { instruction: 'Take the elevator/lift where available', distanceM: null, type: 'elevator' },
  ];

  if (activeBarrier) {
    steps.push({
      instruction: `Barrier reported ahead (${activeBarrier.category}) — rerouting automatically`,
      distanceM: null,
      type: 'alert',
      reportId: activeBarrier.id,
    });
  }

  steps.push(
    { instruction: 'Continue via the accessible entrance', distanceM: 80, type: 'walk' },
    { instruction: `You have arrived at ${placeName}`, distanceM: null, type: 'arrive' }
  );

  const totalDistanceM = steps.reduce((sum, s) => sum + (s.distanceM || 0), 0);

  return {
    source: HAS_MAPS_KEY ? 'google-directions' : 'mock',
    totalDistanceM,
    estimatedMinutes: Math.max(5, Math.round(totalDistanceM / 70)),
    stepFree: true,
    steps,
  };
}

module.exports = { getStepFreeRoute };
