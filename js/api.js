const API_URL = location.hostname === "localhost" ? "http://localhost:8787" : "https://estudio-pj-mza-api.wow-armeria-api.workers.dev";
const TOKEN_KEY = "pj-device-token";
const VISIT_KEY = "pj-last-visit";
const SYNC_INTERVAL_MS = 15_000;

let lastSync = 0;

function readLocal(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocal(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable */
  }
}

function deviceToken() {
  let token = readLocal(TOKEN_KEY);
  if (!token) {
    token = crypto.randomUUID();
    writeLocal(TOKEN_KEY, token);
  }
  return token;
}

async function request(path, options = {}) {
  const response = await fetch(API_URL + path, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${deviceToken()}`, ...options.headers },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "No se pudo conectar.");
  return body;
}

export async function countVisitOncePerDay() {
  const today = new Date().toLocaleDateString("sv-SE");
  if (readLocal(VISIT_KEY) === today) return;
  try {
    await request("/visit", { method: "POST" });
    writeLocal(VISIT_KEY, today);
  } catch {
    /* offline: the visit simply isn't counted */
  }
}

export async function saveProfile(profile) {
  await request("/me", { method: "PUT", body: JSON.stringify(profile) });
  lastSync = Date.now();
}

export async function syncProfile(profile, { force = false } = {}) {
  if (!force && Date.now() - lastSync < SYNC_INTERVAL_MS) return;
  try {
    await saveProfile(profile);
  } catch {
    /* offline or rejected: next sync retries */
  }
}

export const fetchStats = () => request("/stats");
