import { CARDS, EXAM, MODULES, QUESTIONS, cardsOf, questionsOf } from "../data.js";
import { answerOf, exams, isCardMastered } from "../store.js";
import { escapeHtml, percent, progressBar } from "../ui.js";

const answeredRight = (questions) => questions.filter((q) => answerOf(q.id)?.ok).length;
const mastered = (cards) => cards.filter((c) => isCardMastered(c.id)).length;

function moduleCard(mod) {
  const questions = questionsOf(mod.id);
  const cards = cardsOf(mod.id);
  const qPct = percent(answeredRight(questions), questions.length);
  const cPct = percent(mastered(cards), cards.length);
  return `
    <article class="card module-card" style="--chip:${mod.color}">
      <div class="module-num">${mod.num}</div>
      <h3>${escapeHtml(mod.title)}</h3>
      <div class="mini-stat"><span>Preguntas acertadas</span><span>${qPct}%</span></div>
      ${progressBar(qPct, mod.color)}
      <div class="mini-stat"><span>Tarjetas dominadas</span><span>${cPct}%</span></div>
      ${progressBar(cPct, mod.color)}
      <div class="module-links">
        <a href="#/modulo/${mod.id}/resumen">📖 Resumen</a>
        <a href="#/modulo/${mod.id}/mapa">🗺️ Mapa</a>
        <a href="#/modulo/${mod.id}/tarjetas">🃏 Tarjetas</a>
        <a href="#/modulo/${mod.id}/test">📝 Test</a>
      </div>
    </article>`;
}

function lastExamText() {
  const [last] = exams();
  if (!last) return "Todavía no hiciste ningún simulacro.";
  return `Último simulacro: <strong>${percent(last.correct, last.total)}%</strong> (${last.correct}/${last.total})`;
}

export function renderHome(view) {
  const qPct = percent(answeredRight(QUESTIONS), QUESTIONS.length);
  const cPct = percent(mastered(CARDS), CARDS.length);
  view.innerHTML = `
    <section class="hero">
      <div>
        <div class="eyebrow">Concurso de Ingreso Administrativo 2026</div>
        <h1>Preparación para el examen de Conocimientos Específicos</h1>
        <p>${EXAM.questions} preguntas de opción múltiple · ${EXAM.options} opciones · ${EXAM.minutes} minutos. Basado en los 5 módulos oficiales.</p>
        <div class="actions">
          <a class="btn primary big" href="#/simulacro">🎯 Hacer un simulacro</a>
          <a class="btn big" href="#/repaso">🔁 Repasar errores</a>
        </div>
      </div>
      <div class="card stats">
        <div class="stat"><span class="stat-num">${QUESTIONS.length}</span><span>preguntas</span></div>
        <div class="stat"><span class="stat-num">${CARDS.length}</span><span>tarjetas</span></div>
        <div class="stat-line"><span>Preguntas acertadas</span><span>${qPct}%</span></div>
        ${progressBar(qPct)}
        <div class="stat-line"><span>Tarjetas dominadas</span><span>${cPct}%</span></div>
        ${progressBar(cPct)}
        <p class="muted small">${lastExamText()}</p>
      </div>
    </section>
    <h2 class="section-title">Módulos</h2>
    <div class="grid">${MODULES.map(moduleCard).join("")}</div>
    <div class="card tip">
      <strong>💡 Cómo estudiar con la app</strong>
      <ol>
        <li>Leé el <b>resumen</b> y el <b>mapa</b> de un módulo.</li>
        <li>Repasá las <b>tarjetas</b> hasta dominarlas.</li>
        <li>Hacé el <b>test</b> del módulo (corrige al instante).</li>
        <li>Cuando tengas todos, hacé <b>simulacros</b> cronometrados y repasá tus errores.</li>
      </ol>
    </div>`;
}
