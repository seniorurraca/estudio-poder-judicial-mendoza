import { escapeHtml, onLeave, richText } from "../ui.js";

const BULLETS_PER_SLIDE = 4;

function buildSlides(mod) {
  const cover = { cover: true, title: mod.title, subtitle: `Módulo ${mod.num}` };
  const content = mod.summary.flatMap((section) => {
    const chunks = [];
    for (let i = 0; i < section.points.length; i += BULLETS_PER_SLIDE) {
      chunks.push(section.points.slice(i, i + BULLETS_PER_SLIDE));
    }
    return chunks.map((points, part) => ({
      title: chunks.length > 1 ? `${section.title} (${part + 1}/${chunks.length})` : section.title,
      points,
    }));
  });
  return [cover, ...content];
}

export function renderSlides(root, mod) {
  const slides = buildSlides(mod);
  let index = 0;

  function slideHtml(slide) {
    if (slide.cover) {
      return `<div class="slide cover"><div class="eyebrow">${escapeHtml(slide.subtitle)}</div><h2>${escapeHtml(slide.title)}</h2><p>Usá ← → o deslizá para avanzar</p></div>`;
    }
    return `<div class="slide"><h3>${escapeHtml(slide.title)}</h3><ul>${slide.points.map((p) => `<li>${richText(p)}</li>`).join("")}</ul></div>`;
  }

  function render() {
    root.innerHTML = `
      <div class="deck" style="--chip:${mod.color}">
        ${slideHtml(slides[index])}
        <div class="deck-nav">
          <button class="btn" id="prev" ${index === 0 ? "disabled" : ""}>←</button>
          <span>${index + 1} / ${slides.length}</span>
          <button class="btn" id="next" ${index === slides.length - 1 ? "disabled" : ""}>→</button>
        </div>
      </div>`;
    root.querySelector("#prev").addEventListener("click", () => go(-1));
    root.querySelector("#next").addEventListener("click", () => go(1));
    attachSwipe(root.querySelector(".slide"));
  }

  function go(step) {
    const next = index + step;
    if (next < 0 || next >= slides.length) return;
    index = next;
    render();
  }

  function attachSwipe(el) {
    let startX = null;
    el.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX), { passive: true });
    el.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    });
  }

  function onKey(e) {
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
  }

  document.addEventListener("keydown", onKey);
  onLeave(() => document.removeEventListener("keydown", onKey));
  render();
}
