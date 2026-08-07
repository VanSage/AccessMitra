/**
 * AI Verification Service
 * ------------------------
 * Production shape: this calls a separate Python microservice
 * (FastAPI + TensorFlow/OpenCV, per the architecture diagram) that
 * runs a CV model over the uploaded report photo to pre-screen for
 * an actual ramp/obstruction before it ever reaches a human verifier,
 * plus an NLP pass to auto-translate report text for regional users.
 *
 * That model isn't trained/deployed yet, so this stub returns a
 * plausible, clearly-labelled heuristic result and logs a TODO — it
 * lets the rest of the pipeline (upload -> queue -> community review)
 * be built and tested end-to-end today.
 */
const AI_SERVICE_URL = process.env.AI_SERVICE_URL; // e.g. http://cv-service:8001/verify

async function verifyReportPhoto({ photoUrl, category }) {
  if (AI_SERVICE_URL) {
    // TODO(production):
    // const res = await fetch(`${AI_SERVICE_URL}/verify`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ photoUrl, category }),
    // });
    // return res.json(); // { confidence, label, matchesCategory }
  }

  return {
    source: 'stub',
    confidence: null,
    note: 'CV pre-screening not yet connected — report goes straight to community review.',
  };
}

module.exports = { verifyReportPhoto };
