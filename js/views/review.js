import { CARDS, MODULES, QUESTIONS } from "../data.js";
import { answerOf, isCardMastered, resetProgress } from "../store.js";
import { sample } from "../ui.js";
import { runFlashcards } from "./flashcards.js";
import { runQuiz } from "./quiz.js";

const MIXED_SIZE = 20;

const failedQuestions = () => QUESTIONS.filter((q) => answerOf(q.id)?.last === false);
const unseenQuestions = () => QUESTIONS.filter((q) => !answerOf(q.id));
const pendingCards = () => CARDS.filter((c) => !isCardMastered(c.id));

export function renderReview(view) {
  const failed = failedQuestions();
  const unseen = unseenQuestions();
  view.innerHTML = `
    <h1>Repaso</h1>
    <div class="grid">
      <div class="card">
        <h3>❌ Preguntas falladas</h3>
        <p class="muted">${failed.length} preguntas cuya última respuesta fue incorrecta.</p>
        <button class="btn primary" id="failed" ${failed.length ? "" : "disabled"}>Repasar errores</button>
      </div>
      <div class="card">
        <h3>🆕 Preguntas sin ver</h3>
        <p class="muted">${unseen.length} preguntas que todavía no respondiste.</p>
        <button class="btn" id="unseen" ${unseen.length ? "" : "disabled"}>Practicar ${Math.min(MIXED_SIZE, unseen.length)}</button>
      </div>
      <div class="card">
        <h3>🎲 Test mezclado</h3>
        <p class="muted">${MIXED_SIZE} preguntas al azar de todos los módulos, con corrección inmediata.</p>
        <button class="btn" id="mixed">Empezar</button>
      </div>
      <div class="card">
        <h3>🃏 Todas las tarjetas</h3>
        <p class="muted">${pendingCards().length} tarjetas sin dominar de los ${MODULES.length} módulos.</p>
        <button class="btn" id="cards">Repasar tarjetas</button>
      </div>
    </div>
    <div class="card danger-zone">
      <strong>Reiniciar progreso</strong>
      <p class="muted small">Borra respuestas, tarjetas y simulacros guardados en este dispositivo.</p>
      <button class="btn bad" id="reset">Borrar mi progreso</button>
    </div>`;

  const start = (title, questions) => runQuiz(view, { title, questions });
  view.querySelector("#failed").addEventListener("click", () => start("Repaso de errores", failed));
  view.querySelector("#unseen").addEventListener("click", () => start("Preguntas nuevas", sample(unseen, MIXED_SIZE)));
  view.querySelector("#mixed").addEventListener("click", () => start("Test mezclado", sample(QUESTIONS, MIXED_SIZE)));
  view.querySelector("#cards").addEventListener("click", () => {
    view.innerHTML = `<h1>Todas las tarjetas</h1><div id="deck"></div>`;
    runFlashcards(view.querySelector("#deck"), CARDS);
  });
  view.querySelector("#reset").addEventListener("click", () => {
    if (!confirm("¿Seguro? Se borrará todo tu progreso en este dispositivo.")) return;
    resetProgress();
    renderReview(view);
  });
}
