import { cardsOf, moduleById, questionsOf } from "../data.js";
import { escapeHtml, richText, sample } from "../ui.js";
import { runFlashcards } from "./flashcards.js";
import { runQuiz } from "./quiz.js";

const TABS = [
  { id: "resumen", label: "📖 Resumen" },
  { id: "mapa", label: "🗺️ Mapa" },
  { id: "tarjetas", label: "🃏 Tarjetas" },
  { id: "test", label: "📝 Test" },
];

function renderSummary(root, mod) {
  root.innerHTML = `
    <div class="summary">
      <nav class="toc card">
        <strong>Contenido</strong>
        ${mod.summary.map((s, i) => `<a href="#sec-${i}" data-sec="${i}">${escapeHtml(s.title)}</a>`).join("")}
      </nav>
      ${mod.summary
        .map(
          (s, i) => `
        <section class="card summary-sec" id="sec-${i}">
          <h3>${escapeHtml(s.title)}</h3>
          <ul>${s.points.map((p) => `<li>${richText(p)}</li>`).join("")}</ul>
        </section>`
        )
        .join("")}
    </div>`;
  root.querySelectorAll("[data-sec]").forEach((a) =>
    a.addEventListener("click", (event) => {
      event.preventDefault();
      root.querySelector(`#sec-${a.dataset.sec}`).scrollIntoView({ behavior: "smooth" });
    })
  );
}

function renderMap(root, mod) {
  root.innerHTML = `
    <div class="mindmap" style="--chip:${mod.color}">
      <div class="mm-root">${escapeHtml(mod.map.label)}</div>
      <div class="mm-branches">
        ${mod.map.children
          .map(
            (branch) => `
          <div class="mm-branch">
            <div class="mm-node">${escapeHtml(branch.label)}</div>
            <ul>${(branch.children || []).map((leaf) => `<li>${escapeHtml(leaf.label)}</li>`).join("")}</ul>
          </div>`
          )
          .join("")}
      </div>
    </div>
    <p class="hint">Tip: intentá reconstruir el mapa de memoria en una hoja y después comparalo.</p>`;
}

function renderTestStart(root, mod) {
  const questions = questionsOf(mod.id);
  const sizes = [10, 20].filter((n) => n < questions.length);
  root.innerHTML = `
    <div class="card center">
      <h2>Test del Módulo ${mod.num}</h2>
      <p class="muted">${questions.length} preguntas disponibles. Corrección inmediata con explicación.</p>
      <div class="actions">
        ${sizes.map((n) => `<button class="btn" data-n="${n}">${n} preguntas</button>`).join("")}
        <button class="btn primary" data-n="${questions.length}">Todas (${questions.length})</button>
      </div>
    </div>`;
  root.querySelectorAll("[data-n]").forEach((btn) =>
    btn.addEventListener("click", () =>
      runQuiz(root, {
        title: `Test · Módulo ${mod.num}`,
        questions: sample(questions, Number(btn.dataset.n)),
      })
    )
  );
}

const TAB_RENDERERS = {
  resumen: renderSummary,
  mapa: renderMap,
  tarjetas: (root, mod) => runFlashcards(root, cardsOf(mod.id)),
  test: renderTestStart,
};

export function renderModule(view, moduleId, tab = "resumen") {
  const mod = moduleById(moduleId);
  if (!mod) {
    view.innerHTML = `<p>Módulo no encontrado. <a href="#/">Volver</a></p>`;
    return;
  }
  const activeTab = TAB_RENDERERS[tab] ? tab : "resumen";
  view.innerHTML = `
    <div class="module-head" style="--chip:${mod.color}">
      <a href="#/" class="back">← Inicio</a>
      <div class="eyebrow">Módulo ${mod.num}</div>
      <h1>${escapeHtml(mod.title)}</h1>
    </div>
    <nav class="tabs">
      ${TABS.map(
        (t) => `<a href="#/modulo/${mod.id}/${t.id}" class="${t.id === activeTab ? "active" : ""}">${t.label}</a>`
      ).join("")}
    </nav>
    <div id="tab"></div>`;
  TAB_RENDERERS[activeTab](view.querySelector("#tab"), mod);
}
