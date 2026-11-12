import { EXAM, MODULES, questionsOf } from "../data.js";
import { exams, recordExam } from "../store.js";
import { formatTime, percent, sample, shuffle } from "../ui.js";
import { runQuiz } from "./quiz.js";

const PER_MODULE = EXAM.questions / MODULES.length;

const buildExam = () => shuffle(MODULES.flatMap((m) => sample(questionsOf(m.id), PER_MODULE)));

function historyTable() {
  const list = exams();
  if (!list.length) return "";
  return `
    <h3>Tus simulacros</h3>
    <div class="card">
      ${list
        .map(
          (e) => `
        <div class="history-row">
          <span>${new Date(e.date).toLocaleDateString("es-AR")} ${new Date(e.date).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}</span>
          <span>${e.correct}/${e.total}</span>
          <strong>${percent(e.correct, e.total)}%</strong>
          <span class="muted">${formatTime(e.seconds)}</span>
        </div>`
        )
        .join("")}
    </div>`;
}

export function renderExam(view) {
  view.innerHTML = `
    <div class="card center exam-intro">
      <div class="eyebrow">Simulacro</div>
      <h1>Examen de Conocimientos Específicos</h1>
      <ul class="rules">
        <li>📋 <b>${EXAM.questions} preguntas</b> (${PER_MODULE} por módulo, mezcladas)</li>
        <li>⏱️ <b>${EXAM.minutes} minutos</b> — al terminar el tiempo se cierra solo</li>
        <li>🔘 <b>${EXAM.options} opciones</b>, una sola correcta</li>
        <li>➡️ <b>Sin volver atrás</b> y sin corrección hasta el final</li>
      </ul>
      <button class="btn primary big" id="start">Comenzar simulacro</button>
    </div>
    ${historyTable()}`;
  view.querySelector("#start").addEventListener("click", () =>
    runQuiz(view, {
      title: "Simulacro",
      questions: buildExam(),
      mode: "exam",
      timeLimitSec: EXAM.minutes * 60,
      onFinish: recordExam,
    })
  );
}
