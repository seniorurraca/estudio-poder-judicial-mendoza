import { addVisit, nicknameTaken, readStats, upsertPlayer } from "./db.mjs";
import { parsePlayer, validToken } from "./validate.mjs";

const TIME_ZONE = "America/Argentina/Mendoza";

const splitList = (value) => (value ?? "").split(",").map((s) => s.trim()).filter(Boolean);

const today = () => new Date().toLocaleDateString("sv-SE", { timeZone: TIME_ZONE });

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin");
  if (!splitList(env.ALLOWED_ORIGINS).includes(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

const json = (body, status, headers) =>
  new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });

async function playerIdFrom(request) {
  const token = request.headers.get("Authorization")?.replace(/^Bearer /, "");
  if (!validToken(token)) return null;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function saveMe(request, env) {
  const id = await playerIdFrom(request);
  if (!id) return [{ error: "no autorizado" }, 401];
  const { player, error } = parsePlayer(await request.json().catch(() => null));
  if (error) return [{ error }, 400];
  if (await nicknameTaken(env.DB, player.nickname, id)) return [{ error: "Ese apodo ya está en uso." }, 409];
  await upsertPlayer(env.DB, { ...player, id, day: today() });
  return [{ ok: true }, 200];
}

async function route(request, env) {
  const { pathname } = new URL(request.url);
  if (pathname === "/stats" && request.method === "GET") return [await readStats(env.DB, today()), 200];
  if (pathname === "/visit" && request.method === "POST") {
    await addVisit(env.DB, today());
    return [{ ok: true }, 200];
  }
  if (pathname === "/me" && request.method === "PUT") return saveMe(request, env);
  return [{ error: "no encontrado" }, 404];
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request, env);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    const [body, status] = await route(request, env);
    return json(body, status, cors);
  },
};
