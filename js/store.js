const KEY = "pj-mza-2026-progress-v1";
const MAX_CARD_LEVEL = 3;

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

let state = { answers: {}, cards: {}, exams: [], ...load() };

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable: progress lives only in memory */
  }
}

export function recordAnswer(questionId, correct) {
  const entry = state.answers[questionId] || { ok: 0, bad: 0 };
  if (correct) entry.ok++;
  else entry.bad++;
  entry.last = correct;
  state.answers[questionId] = entry;
  save();
}

export const answerOf = (questionId) => state.answers[questionId];

export const cardLevel = (cardId) => state.cards[cardId] || 0;

export function rateCard(cardId, known) {
  state.cards[cardId] = known ? Math.min(cardLevel(cardId) + 1, MAX_CARD_LEVEL) : 0;
  save();
}

export const isCardMastered = (cardId) => cardLevel(cardId) >= 2;

export function recordExam(result) {
  state.exams = [result, ...state.exams].slice(0, 20);
  save();
}

export const exams = () => state.exams;

export function resetProgress() {
  state = { answers: {}, cards: {}, exams: [] };
  save();
}
