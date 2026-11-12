import { CARDS, EXAM, MODULES, NOTEBOOK_URL, QUESTIONS, cardsOf, moduleById, questionsOf } from "../data.js";
import { DAILY_GOAL, answerOf, exams, isCardMastered, lastVisit, nickname, streak, todayCount } from "../store.js";
import { escapeHtml, percent } from "../ui.js";
import { TABS } from "./module.js";

const answeredRight = (questions) => questions.filter((q) => answerOf(q.id)?.ok).length;
const mastered = (cards) => cards.filter((c) => isCardMastered(c.id)).length;

const ring = (value, color, label) => `
  <div class="ring" style="--value:${value};--ring:${color}"><span>${label}</span></div>`;

function moduleProgress(mod) {
  const questions = questionsOf(mod.id);
  const cards = cardsOf(mod.id);
  return percent(answeredRight(questions) + mastered(cards), questions.length + cards.length);
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "¡Buen día!";
  if (hour < 20) return "¡Buenas tardes!";
  return "¡Buenas noches!";
}

function continueCard() {
  const last = lastVisit();
  const mod = last && moduleById(last.moduleId);
  const tool = mod && TABS.find((t) => t.id === last.tab);
  if (!tool) {
    return `
      <a class="continue-card" href="#/modulo/m1" style="--chip:${MODULES[0].color}">
        <span class="tool-icon" style="--tool:${MODULES[0].color}">🚀</span>
        <span><small>Empezá por acá</small><strong>Módulo 1 · ${escapeHtml(MODULES[0].short)}</strong></span>
        <span class="arrow">→</span>
      </a>`;
  }
  return `
    <a class="continue-card" href="#/modulo/${mod.id}/${tool.id}" style="--chip:${mod.color}">
      <span class="tool-icon" style="--tool:${tool.color}">${tool.icon}</span>
      <span><small>Continuar donde dejaste</small><strong>${tool.label} · M${mod.num} ${escapeHtml(mod.short)}</strong></span>
      <span class="arrow">→</span>
    </a>`;
}

const moduleRow = (mod) => {
  const value = moduleProgress(mod);
  return `
    <a class="module-row" href="#/modulo/${mod.id}" style="--chip:${mod.color}">
      <span class="module-num">${mod.num}</span>
      <span class="module-info">
        <strong>${escapeHtml(mod.title)}</strong>
        <small>${mod.questions.length} preguntas · ${mod.cards.length} tarjetas</small>
      </span>
      ${ring(value, mod.color, `${value}%`)}
    </a>`;
};

function lastExamText() {
  const [last] = exams();
  return last ? `${percent(last.correct, last.total)}%` : "—";
}

export function renderHome(view) {
  const today = todayCount();
  const goalPct = Math.min(100, percent(today, DAILY_GOAL));
  const days = streak();
  view.innerHTML = `
    <section class="welcome">
      <div>
        <h1>${greeting()}${nickname() ? `, ${escapeHtml(nickname())}` : ""} 👋</h1>
        <p class="muted">Examen de Conocimientos Específicos · ${EXAM.questions} preguntas · ${EXAM.minutes} min</p>
      </div>
      <div class="pill-stats">
        <a href="#/ranking" class="pill streak ${days ? "on" : ""}">🔥 ${days} ${days === 1 ? "día" : "días"}</a>
      </div>
    </section>

    <section class="today card">
      ${ring(goalPct, "var(--accent)", `${today}/${DAILY_GOAL}`)}
      <div class="today-text">
        <strong>${goalPct >= 100 ? "¡Meta diaria cumplida! 🎉" : "Meta diaria"}</strong>
        <span class="muted small">Respondé ${DAILY_GOAL} preguntas o tarjetas por día para mantener la racha.</span>
      </div>
    </section>

    ${continueCard()}

    <div class="quick-actions">
      <a class="quick" href="#/simulacro" style="--tool:#4f46e5"><span class="tool-icon">🎯</span><strong>Simulacro</strong><small>50 preg · 40 min</small></a>
      <a class="quick" href="#/repaso" style="--tool:#dc2626"><span class="tool-icon">🔁</span><strong>Repaso</strong><small>Tus errores</small></a>
      <a class="quick" href="${NOTEBOOK_URL}" target="_blank" rel="noopener" style="--tool:#059669"><span class="tool-icon">💬</span><strong>Preguntar</strong><small>IA NotebookLM</small></a>
    </div>

    <h2 class="group-title">Módulos</h2>
    <div class="module-list">${MODULES.map(moduleRow).join("")}</div>

    <section class="stats-strip card">
      <div><b>${percent(answeredRight(QUESTIONS), QUESTIONS.length)}%</b><span>preguntas acertadas</span></div>
      <div><b>${mastered(CARDS)}/${CARDS.length}</b><span>tarjetas dominadas</span></div>
      <div><b>${lastExamText()}</b><span>último simulacro</span></div>
    </section>`;
}
