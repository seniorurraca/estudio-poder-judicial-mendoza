import { moduleById } from "../data.js";
import { recordAnswer } from "../store.js";
import { escapeHtml, formatTime, LETTERS, onLeave, percent, progressBar, shuffle } from "../ui.js";

const withShuffledOptions = (question) => {
  const order = shuffle(question.options.map((_, i) => i));
  return {
    ...question,
    options: order.map((i) => question.options[i]),
    answer: order.indexOf(question.answer),
  };
};

export function runQuiz(root, { title, questions, mode = "practice", timeLimitSec = 0, onFinish }) {
  const isExam = mode === "exam";
  const items = questions.map(withShuffledOptions);
  const picks = new Array(items.length).fill(null);
  const startedAt = Date.now();
  let index = 0;
  let timerId = null;

  const elapsed = () => (Date.now() - startedAt) / 1000;

  function renderQuestion() {
    const item = items[index];
    const mod = moduleById(item.moduleId);
    root.innerHTML = `
      <div class="quiz">
        <div class="quiz-head">
          <div>
            <div class="eyebrow">${escapeHtml(title)}</div>
            <div class="quiz-count">Pregunta ${index + 1} de ${items.length}</div>
          </div>
          ${timeLimitSec ? `<div class="timer" id="timer">${formatTime(timeLimitSec - elapsed())}</div>` : ""}
        </div>
        ${progressBar(percent(index, items.length))}
        <div class="card question-card">
          <span class="chip" style="--chip:${mod.color}">Módulo ${mod.num} · ${escapeHtml(mod.short)}</span>
          <h2 class="question">${escapeHtml(item.q)}</h2>
          <div class="options">
            ${item.options
              .map(
                (opt, i) => `
              <button class="option" data-i="${i}">
                <span class="letter">${LETTERS[i]}</span><span>${escapeHtml(opt)}</span>
              </button>`
              )
              .join("")}
          </div>
          <div id="feedback"></div>
        </div>
        ${isExam ? `<p class="hint">Como en el examen real: no se puede volver atrás.</p>` : ""}
      </div>`;
    root.querySelectorAll(".option").forEach((btn) =>
      btn.addEventListener("click", () => choose(Number(btn.dataset.i)))
    );
  }

  function choose(i) {
    if (picks[index] !== null) return;
    const item = items[index];
    const correct = i === item.answer;
    picks[index] = i;
    recordAnswer(item.id, correct);
    if (isExam) return next();
    showFeedback(i, correct, item);
  }

  function showFeedback(chosen, correct, item) {
    root.querySelectorAll(".option").forEach((btn) => {
      const i = Number(btn.dataset.i);
      btn.disabled = true;
      if (i === item.answer) btn.classList.add("right");
      else if (i === chosen) btn.classList.add("wrong");
    });
    const isLast = index === items.length - 1;
    root.querySelector("#feedback").innerHTML = `
      <div class="feedback ${correct ? "ok" : "bad"}">
        <strong>${correct ? "✅ ¡Correcto!" : "❌ Incorrecto"}</strong>
        <p>${escapeHtml(item.exp)}</p>
      </div>
      <button class="btn primary" id="next">${isLast ? "Ver resultado" : "Siguiente →"}</button>`;
    const nextBtn = root.querySelector("#next");
    nextBtn.addEventListener("click", next);
    nextBtn.focus();
  }

  function next() {
    if (index < items.length - 1) {
      index++;
      renderQuestion();
    } else {
      finish();
    }
  }

  function tick() {
    const remaining = timeLimitSec - elapsed();
    const el = root.querySelector("#timer");
    if (el) {
      el.textContent = formatTime(remaining);
      el.classList.toggle("low", remaining < 300);
    }
    if (remaining <= 0) finish();
  }

  function finish() {
    clearInterval(timerId);
    timerId = null;
    const correct = picks.filter((p, i) => p === items[i].answer).length;
    const result = { correct, total: items.length, seconds: Math.round(elapsed()), date: Date.now() };
    onFinish?.(result);
    renderResults(result);
  }

  function moduleBreakdown() {
    const byModule = {};
    items.forEach((item, i) => {
      const entry = (byModule[item.moduleId] ||= { ok: 0, total: 0 });
      entry.total++;
      if (picks[i] === item.answer) entry.ok++;
    });
    return Object.entries(byModule)
      .map(([id, { ok, total }]) => {
        const mod = moduleById(id);
        return `<div class="break-row"><span>M${mod.num} · ${escapeHtml(mod.short)}</span><span>${ok}/${total}</span>${progressBar(percent(ok, total), mod.color)}</div>`;
      })
      .join("");
  }

  function mistakesList() {
    const wrong = items.map((item, i) => ({ item, pick: picks[i] })).filter(({ item, pick }) => pick !== item.answer);
    if (!wrong.length) return `<p class="muted">¡Sin errores! 🎉</p>`;
    return wrong
      .map(
        ({ item, pick }) => `
        <div class="card mistake">
          <p class="question small">${escapeHtml(item.q)}</p>
          ${pick === null ? `<p class="bad-text">Sin responder</p>` : `<p class="bad-text">Tu respuesta: ${escapeHtml(item.options[pick])}</p>`}
          <p class="ok-text">Correcta: ${escapeHtml(item.options[item.answer])}</p>
          <p class="muted">${escapeHtml(item.exp)}</p>
        </div>`
      )
      .join("");
  }

  function renderResults({ correct, total, seconds }) {
    const score = percent(correct, total);
    const verdict = score >= 80 ? "¡Excelente! 🏆" : score >= 60 ? "Bien, seguí practicando 💪" : "A repasar 📚";
    root.innerHTML = `
      <div class="results">
        <div class="card score-card">
          <div class="eyebrow">${escapeHtml(title)}</div>
          <div class="score" style="--score:${score}">${score}%</div>
          <p class="score-detail">${correct} de ${total} correctas · ${formatTime(seconds)} min</p>
          <p class="verdict">${verdict}</p>
          <div class="actions">
            <button class="btn primary" id="retry">Repetir</button>
            <a class="btn" href="#/">Volver al inicio</a>
          </div>
        </div>
        <h3>Por módulo</h3>
        <div class="card">${moduleBreakdown()}</div>
        <h3>Para repasar</h3>
        ${mistakesList()}
      </div>`;
    root.querySelector("#retry").addEventListener("click", () =>
      runQuiz(root, { title, questions, mode, timeLimitSec, onFinish })
    );
    window.scrollTo(0, 0);
  }

  renderQuestion();
  if (timeLimitSec) {
    timerId = setInterval(tick, 1000);
    onLeave(() => clearInterval(timerId));
  }
}
