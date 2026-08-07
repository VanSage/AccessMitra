/**
 * Notification Service
 * ----------------------
 * Wraps Firebase Cloud Messaging so the rest of the app never talks
 * to Firebase directly. When FIREBASE_SERVICE_ACCOUNT isn't configured
 * (e.g. local dev), calls are logged instead of sent — this keeps the
 * report -> verify -> notify flow testable without live credentials.
 */
const HAS_FIREBASE = Boolean(process.env.FIREBASE_SERVICE_ACCOUNT);
let admin = null;

if (HAS_FIREBASE) {
  // TODO(production): uncomment once the service account JSON is mounted.
  // admin = require('firebase-admin');
  // admin.initializeApp({
  //   credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  // });
}

async function notifyReportVerified({ userId, placeName, category }) {
  const payload = {
    title: 'A report near you was verified',
    body: `${category} at ${placeName} was confirmed by the community. Thanks for helping!`,
  };

  if (HAS_FIREBASE && admin) {
    // TODO(production): look up the user's device token(s) and send:
    // await admin.messaging().send({ token: deviceToken, notification: payload });
    return { sent: true, channel: 'fcm' };
  }

  console.log(`[notify:stub] -> user ${userId}: ${payload.title} — ${payload.body}`);
  return { sent: false, channel: 'log', payload };
}

module.exports = { notifyReportVerified };
