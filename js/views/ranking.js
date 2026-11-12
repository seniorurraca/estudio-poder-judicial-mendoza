import { fetchStats, syncProfile } from "../api.js";
import { nickname, profileSnapshot } from "../store.js";
import { escapeHtml } from "../ui.js";
import { openNicknameDialog } from "./nickname.js";

const MEDALS = ["🥇", "🥈", "🥉"];

const counter = (value, label, icon) => `<div class="counter"><span>${icon}</span><b>${value}</b><small>${label}</small></div>`;

function leaderboardRows(rows) {
  const me = nickname().toLowerCase();
  if (!rows.length) return `<p class="muted center">Todavía no hay nadie en el ranking.</p>`;
  return rows
    .map(
      (r, i) => `
      <div class="lb-row ${r.nickname.toLowerCase() === me ? "me" : ""}">
        <span class="lb-pos">${MEDALS[i] || i + 1}</span>
        <span class="lb-name">${escapeHtml(r.nickname)}${r.today ? `<small>${r.today} hoy</small>` : ""}</span>
        <span class="lb-stat" title="Racha">🔥 ${r.streak}</span>
        <span class="lb-stat" title="Respondidas">✍️ ${r.answered}</span>
        <span class="lb-stat" title="Mejor simulacro">🎯 ${r.bestExam}%</span>
      </div>`
    )
    .join("");
}

export async function renderRanking(view) {
  view.innerHTML = `
    <h1>🏆 Ranking</h1>
    <p class="muted">Ordenado por racha de días seguidos. Jugás como <b>${escapeHtml(nickname())}</b> · <a href="#" id="rename">cambiar apodo</a></p>
    <div id="ranking"><div class="card center muted">Cargando…</div></div>`;
  view.querySelector("#rename").addEventListener("click", (event) => {
    event.preventDefault();
    openNicknameDialog({ canClose: true, onDone: () => renderRanking(view) });
  });

  const box = view.querySelector("#ranking");
  try {
    await syncProfile(profileSnapshot(), { force: true });
    const { visits, players, leaderboard } = await fetchStats();
    if (!box.isConnected) return;
    box.innerHTML = `
      <div class="counters">
        ${counter(visits.total, "visitas totales", "👀")}
        ${counter(visits.today, "visitas hoy", "📅")}
        ${counter(players.total, "estudiantes", "👥")}
        ${counter(players.today, "estudiando hoy", "📚")}
      </div>
      <div class="card leaderboard">
        <div class="lb-row lb-head"><span>#</span><span>Apodo</span><span>Racha</span><span>Resp.</span><span>Simul.</span></div>
        ${leaderboardRows(leaderboard)}
      </div>
      <p class="hint">Se actualiza cada vez que estudiás. La racha se mantiene respondiendo al menos una pregunta o tarjeta por día.</p>`;
  } catch {
    if (box.isConnected) box.innerHTML = `<div class="card center">No se pudo cargar el ranking. Revisá tu conexión e intentá de nuevo.</div>`;
  }
}
