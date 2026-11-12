const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (c) => ESCAPES[c]);

export const richText = (text) =>
  escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");

export function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const sample = (list, count) => shuffle(list).slice(0, count);

export function formatTime(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export const percent = (part, total) => (total ? Math.round((part / total) * 100) : 0);

export function progressBar(value, color = "var(--accent)") {
  return `<div class="bar"><span style="width:${value}%;background:${color}"></span></div>`;
}

export const LETTERS = ["A", "B", "C", "D"];

let leaveHandlers = [];

export const onLeave = (handler) => leaveHandlers.push(handler);

export function runLeaveHandlers() {
  leaveHandlers.forEach((handler) => handler());
  leaveHandlers = [];
}
