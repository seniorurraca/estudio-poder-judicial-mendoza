import { escapeHtml } from "../ui.js";

const labeled = (items) =>
  items.map((it) => `<div class="ig-card"><strong>${escapeHtml(it.label)}</strong><span>${escapeHtml(it.text)}</span></div>`).join("");

const INFOGRAPHIC_RENDERERS = {
  cards: (ig) => `<div class="ig-cards">${labeled(ig.items)}</div>`,
  steps: (ig) =>
    `<ol class="ig-steps">${ig.items.map((it) => `<li><strong>${escapeHtml(it.label)}</strong><span>${escapeHtml(it.text)}</span></li>`).join("")}</ol>`,
  cycle: (ig) =>
    `<div class="ig-cycle">${labeled(ig.items)}</div>${ig.note ? `<p class="ig-note">🔁 ${escapeHtml(ig.note)}</p>` : ""}`,
  scale: (ig) =>
    `<div class="ig-scale">${ig.items.map((it, i) => `<div class="ig-level" style="--lvl:${(i + 1) / ig.items.length}"><strong>${escapeHtml(it.label)}</strong><span>${escapeHtml(it.text)}</span></div>`).join("")}</div>`,
  pyramid: (ig) =>
    `<div class="ig-pyramid">${ig.items.map((it, i) => `<div style="--w:${40 + (60 * i) / (ig.items.length - 1)}%">${escapeHtml(it)}</div>`).join("")}</div>`,
  stats: (ig) =>
    `<div class="ig-stats">${ig.items.map((it) => `<div><b>${escapeHtml(it.num)}</b><span>${escapeHtml(it.label)}</span></div>`).join("")}</div>`,
  compare: (ig) =>
    `<div class="ig-compare">${[ig.left, ig.right]
      .map((side) => `<div><h4>${escapeHtml(side.label)}</h4><ul>${side.items.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul></div>`)
      .join("")}</div>`,
};

export function renderInfographics(root, mod) {
  root.innerHTML = `
    <div class="infographics" style="--chip:${mod.color}">
      ${mod.infographics
        .map((ig) => `<section class="card infographic"><h3>${escapeHtml(ig.title)}</h3>${INFOGRAPHIC_RENDERERS[ig.type](ig)}</section>`)
        .join("")}
    </div>`;
}

export function renderTable(root, mod) {
  root.innerHTML = `
    <div class="card" style="--chip:${mod.color}">
      <input class="search" id="q" type="search" placeholder="🔎 Buscar ley, artículo, plazo…">
      <table class="data-table">
        <thead><tr><th>Tema</th><th>Dato</th></tr></thead>
        <tbody>${mod.table.map((r) => `<tr><td>${escapeHtml(r.topic)}</td><td>${escapeHtml(r.value)}</td></tr>`).join("")}</tbody>
      </table>
      <p class="hint">Tip: tapá la columna “Dato” e intentá recordarla.</p>
    </div>`;
  const rows = [...root.querySelectorAll("tbody tr")];
  root.querySelector("#q").addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    rows.forEach((row) => (row.hidden = !row.textContent.toLowerCase().includes(query)));
  });
}

export function renderGuide(root, mod) {
  const { mustKnow, traps } = mod.guide;
  root.innerHTML = `
    <div style="--chip:${mod.color}">
      <section class="card">
        <h3>🎯 Lo que no puede faltar</h3>
        <ol class="guide-list">${mustKnow.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ol>
      </section>
      <h3>⚠️ No confundir</h3>
      <div class="traps">
        ${traps
          .map(
            (t) => `
          <div class="card trap">
            <div class="trap-head"><span>${escapeHtml(t.a)}</span><em>vs</em><span>${escapeHtml(t.b)}</span></div>
            <p>${escapeHtml(t.diff)}</p>
          </div>`
          )
          .join("")}
      </div>
    </div>`;
}
