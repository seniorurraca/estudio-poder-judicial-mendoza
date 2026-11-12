import { cardsOf, moduleById, questionsOf } from "../data.js";
import { setLastVisit } from "../store.js";
import { escapeHtml, richText, sample } from "../ui.js";
import { renderAudio } from "./audio.js";
import { runFlashcards } from "./flashcards.js";
import { runQuiz } from "./quiz.js";
import { renderSlides } from "./slides.js";
import { renderGuide, renderInfographics, renderTable } from "./studio.js";

const TOOL_GROUPS = ["Aprender", "Repasar", "Practicar"];

export const TABS = [
  { id: "resumen", icon: "📖", label: "Resumen", desc: "Lo esencial, por secciones", group: "Aprender", color: "#4f46e5" },
  { id: "audio", icon: "🎧", label: "Audio", desc: "Escuchá el resumen", group: "Aprender", color: "#0891b2" },
  { id: "presentacion", icon: "🖥️", label: "Presentación", desc: "Diapositivas para pasar", group: "Aprender", color: "#db2777" },
  { id: "mapa", icon: "🗺️", label: "Mapa mental", desc: "Vista de conjunto", group: "Aprender", color: "#7c3aed" },
  { id: "infografia", icon: "📊", label: "Infografía", desc: "Esquemas visuales", group: "Aprender", color: "#ea580c" },
  { id: "datos", icon: "📋", label: "Tabla de datos", desc: "Leyes, plazos y artículos", group: "Repasar", color: "#059669" },
  { id: "guia", icon: "🎯", label: "Guía", desc: "Clave y “no confundir”", group: "Repasar", color: "#dc2626" },
  { id: "tarjetas", icon: "🃏", label: "Tarjetas", desc: "Memorizá con flashcards", group: "Practicar", color: "#ca8a04" },
  { id: "test", icon: "📝", label: "Cuestionario", desc: "Preguntas con corrección", group: "Practicar", color: "#2563eb" },
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
  audio: renderAudio,
  mapa: renderMap,
  presentacion: renderSlides,
  infografia: renderInfographics,
  datos: renderTable,
  guia: renderGuide,
  tarjetas: (root, mod) => runFlashcards(root, cardsOf(mod.id)),
  test: renderTestStart,
};

const toolTile = (mod, t) => `
  <a class="tool-tile" href="#/modulo/${mod.id}/${t.id}" style="--tool:${t.color}">
    <span class="tool-icon">${t.icon}</span>
    <span class="tool-text"><strong>${t.label}</strong><small>${t.desc}</small></span>
  </a>`;

function renderStudioHome(view, mod) {
  view.innerHTML = `
    <div class="module-banner" style="--chip:${mod.color}">
      <a href="#/" class="back">← Inicio</a>
      <div class="eyebrow">Módulo ${mod.num}</div>
      <h1>${escapeHtml(mod.title)}</h1>
      <p>${mod.summary.length} secciones · ${mod.cards.length} tarjetas · ${mod.questions.length} preguntas</p>
    </div>
    ${TOOL_GROUPS.map(
      (group) => `
      <h2 class="group-title">${group}</h2>
      <div class="tool-grid">${TABS.filter((t) => t.group === group).map((t) => toolTile(mod, t)).join("")}</div>`
    ).join("")}`;
}

function renderTool(view, mod, tab) {
  const tool = TABS.find((t) => t.id === tab);
  view.innerHTML = `
    <div class="tool-head" style="--chip:${mod.color}">
      <a href="#/modulo/${mod.id}" class="back">← Módulo ${mod.num} · ${escapeHtml(mod.short)}</a>
      <h1><span class="tool-icon small" style="--tool:${tool.color}">${tool.icon}</span>${tool.label}</h1>
    </div>
    <nav class="tabs">
      ${TABS.map(
        (t) => `<a href="#/modulo/${mod.id}/${t.id}" class="${t.id === tab ? "active" : ""}">${t.icon} ${t.label}</a>`
      ).join("")}
    </nav>
    <div id="tab"></div>`;
  view.querySelector(".tabs .active").scrollIntoView({ inline: "center", block: "nearest" });
  setLastVisit(mod.id, tab);
  TAB_RENDERERS[tab](view.querySelector("#tab"), mod);
}

export function renderModule(view, moduleId, tab) {
  const mod = moduleById(moduleId);
  if (!mod) {
    view.innerHTML = `<p>Módulo no encontrado. <a href="#/">Volver</a></p>`;
    return;
  }
  if (TAB_RENDERERS[tab]) renderTool(view, mod, tab);
  else renderStudioHome(view, mod);
}
