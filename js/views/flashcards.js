import { moduleById } from "../data.js";
import { cardLevel, isCardMastered, rateCard } from "../store.js";
import { escapeHtml, onLeave, percent, progressBar, shuffle } from "../ui.js";

export function runFlashcards(root, cards) {
  const pending = cards.filter((c) => !isCardMastered(c.id));
  let deck = shuffle(pending.length ? pending : cards);
  let index = 0;
  let flipped = false;

  function render() {
    if (index >= deck.length) return renderDone();
    const card = deck[index];
    const mod = moduleById(card.moduleId);
    const mastered = cards.filter((c) => isCardMastered(c.id)).length;
    root.innerHTML = `
      <div class="flash-wrap">
        <div class="flash-stats">
          <span>Tarjeta ${index + 1} de ${deck.length}</span>
          <span>Dominadas: ${mastered}/${cards.length}</span>
        </div>
        ${progressBar(percent(mastered, cards.length), mod.color)}
        <button class="flashcard ${flipped ? "flipped" : ""}" id="flip" style="--chip:${mod.color}" aria-label="Dar vuelta la tarjeta">
          <div class="face front">
            <span class="face-label">Pregunta · nivel ${cardLevel(card.id)}/3</span>
            <p>${escapeHtml(card.q)}</p>
            <span class="face-hint">Tocá para ver la respuesta</span>
          </div>
          <div class="face back">
            <span class="face-label">Respuesta</span>
            <p>${escapeHtml(card.a)}</p>
          </div>
        </button>
        <div class="flash-actions ${flipped ? "" : "hidden"}">
          <button class="btn bad" id="again">🔁 No la sabía</button>
          <button class="btn good" id="know">✅ La sabía</button>
        </div>
        <p class="hint">Atajos: espacio = girar · 1 = no la sabía · 2 = la sabía</p>
      </div>`;
    root.querySelector("#flip").addEventListener("click", flip);
    root.querySelector("#again").addEventListener("click", () => rate(false));
    root.querySelector("#know").addEventListener("click", () => rate(true));
  }

  function flip() {
    flipped = !flipped;
    root.querySelector("#flip").classList.toggle("flipped", flipped);
    root.querySelector(".flash-actions").classList.toggle("hidden", !flipped);
  }

  function rate(known) {
    const card = deck[index];
    rateCard(card.id, known);
    if (!known) deck.push(card);
    index++;
    flipped = false;
    render();
  }

  function renderDone() {
    root.innerHTML = `
      <div class="card center">
        <h2>¡Mazo terminado! 🎉</h2>
        <p class="muted">Las tarjetas que marcaste como “la sabía” dos veces quedan dominadas y salen del repaso.</p>
        <button class="btn primary" id="restart">Repasar de nuevo</button>
      </div>`;
    root.querySelector("#restart").addEventListener("click", () => runFlashcards(root, cards));
  }

  function onKey(event) {
    if (!root.isConnected || index >= deck.length) return;
    if (event.code === "Space") {
      event.preventDefault();
      flip();
    } else if (flipped && event.key === "1") rate(false);
    else if (flipped && event.key === "2") rate(true);
  }

  document.addEventListener("keydown", onKey);
  onLeave(() => document.removeEventListener("keydown", onKey));
  render();
}
