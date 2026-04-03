let admin;

const getAdmin = () => {
  if (admin) return admin;
  admin = require("firebase-admin");
  return admin;
};

const path = require("path");
const fs = require("fs");

const initPush = () => {
  const serviceAccountPath = path.join(__dirname, "../firebase-service-account.json");

  if (fs.existsSync(serviceAccountPath)) {
    const parsed = require(serviceAccountPath);
    const a = getAdmin();

    console.log('[push] Initialized successfully with firebase-service-account.json');
    return { enabled: true };
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      const a = getAdmin();
      if (!a.apps.length) {
        a.initializeApp({
          credential: a.credential.cert(parsed),
        });
      }
      console.log('[push] Initialized successfully via FIREBASE_SERVICE_ACCOUNT env variable');
      return { enabled: true };
    } catch (e) {
      console.error('[push] Failed to parse FIREBASE_SERVICE_ACCOUNT env variable:', e.message);
    }
  }

  console.warn('[push] Initialization failed: No firebase config found (file or environment variable)!');
  return { enabled: false };
};

const state = initPush();

const isPushEnabled = () => Boolean(state.enabled);

const sendPush = async ({ tokens, title, body, data = {} }) => {
  if (!isPushEnabled()) return { ok: false, error: "push_disabled" };
  if (!Array.isArray(tokens) || tokens.length === 0) return { ok: false, error: "no_tokens" };

  const a = getAdmin();
  const payload = {
    tokens,
    notification: {
      title: title ?? "",
      body: body ?? "",
    },
    android: {
      notification: {
        channel_id: 'fcm_default_channel',
        priority: 'high',
      }
    },
    data: Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v == null ? "" : String(v)])
    ),
  };

  const result = await a.messaging().sendEachForMulticast(payload);
  return { ok: true, successCount: result.successCount, failureCount: result.failureCount, responses: result.responses };
};

module.exports = { isPushEnabled, sendPush };
