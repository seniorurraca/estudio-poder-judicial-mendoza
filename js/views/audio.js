import { escapeHtml, onLeave } from "../ui.js";

const RATES = [0.9, 1, 1.15, 1.3];

const plainText = (text) => text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/→/g, ", ");

const spanishVoice = () =>
  speechSynthesis.getVoices().find((v) => v.lang.startsWith("es-AR")) ||
  speechSynthesis.getVoices().find((v) => v.lang.startsWith("es"));

function buildTrack(mod) {
  return mod.summary.map((section) => ({
    title: section.title,
    text: [section.title + ".", ...section.points.map(plainText)].join(" "),
  }));
}

export function renderAudio(root, mod) {
  if (!("speechSynthesis" in window)) {
    root.innerHTML = `<div class="card center"><p>Este navegador no soporta lectura en voz alta. Probá con Chrome.</p></div>`;
    return;
  }
  const track = buildTrack(mod);
  let current = -1;
  let rate = 1;
  let playing = false;

  root.innerHTML = `
    <div class="card audio-player" style="--chip:${mod.color}">
      <div class="audio-title">🎧 Resumen en audio · Módulo ${mod.num}</div>
      <p class="muted small">Lee el resumen en voz alta, sección por sección. Ideal para repasar viajando o caminando.</p>
      <div class="audio-controls">
        <button class="btn primary big" id="play">▶️ Reproducir</button>
        <button class="btn" id="stop">⏹️ Detener</button>
        <label class="rate">Velocidad
          <select id="rate">${RATES.map((r) => `<option value="${r}" ${r === 1 ? "selected" : ""}>${r}x</option>`).join("")}</select>
        </label>
      </div>
      <ol class="audio-list">
        ${track.map((t, i) => `<li><button class="audio-item" data-i="${i}">${escapeHtml(t.title)}</button></li>`).join("")}
      </ol>
    </div>`;

  const playBtn = root.querySelector("#play");

  function highlight() {
    root.querySelectorAll(".audio-item").forEach((b) => b.classList.toggle("active", Number(b.dataset.i) === current));
    playBtn.textContent = playing ? "⏸️ Pausar" : speechSynthesis.paused ? "▶️ Continuar" : "▶️ Reproducir";
  }

  function speak(i) {
    speechSynthesis.cancel();
    if (i >= track.length) {
      current = -1;
      playing = false;
      return highlight();
    }
    current = i;
    playing = true;
    const utterance = new SpeechSynthesisUtterance(track[i].text);
    utterance.lang = "es-AR";
    utterance.voice = spanishVoice() || null;
    utterance.rate = rate;
    utterance.onend = () => {
      if (playing && current === i) speak(i + 1);
    };
    speechSynthesis.speak(utterance);
    highlight();
  }

  playBtn.addEventListener("click", () => {
    if (playing) {
      speechSynthesis.pause();
      playing = false;
    } else if (speechSynthesis.paused) {
      speechSynthesis.resume();
      playing = true;
    } else {
      speak(Math.max(current, 0));
    }
    highlight();
  });

  root.querySelector("#stop").addEventListener("click", stop);
  root.querySelector("#rate").addEventListener("change", (e) => {
    rate = Number(e.target.value);
    if (playing) speak(current);
  });
  root.querySelectorAll(".audio-item").forEach((b) => b.addEventListener("click", () => speak(Number(b.dataset.i))));

  function stop() {
    playing = false;
    current = -1;
    speechSynthesis.cancel();
    highlight();
  }

  onLeave(stop);
}
