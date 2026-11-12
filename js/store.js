const KEY = "pj-mza-2026-progress-v1";
const MAX_CARD_LEVEL = 3;
const DAY_MS = 86_400_000;

export const DAILY_GOAL = 20;

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

const emptyState = () => ({ answers: {}, cards: {}, exams: [], days: {}, last: null });

let state = { ...emptyState(), ...load() };

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable: progress lives only in memory */
  }
}

const dayKey = (time = Date.now()) => new Date(time).toLocaleDateString("sv-SE");

function countActivity() {
  const today = dayKey();
  state.days[today] = (state.days[today] || 0) + 1;
}

export function recordAnswer(questionId, correct) {
  const entry = state.answers[questionId] || { ok: 0, bad: 0 };
  if (correct) entry.ok++;
  else entry.bad++;
  entry.last = correct;
  state.answers[questionId] = entry;
  countActivity();
  save();
}

export const answerOf = (questionId) => state.answers[questionId];

export const cardLevel = (cardId) => state.cards[cardId] || 0;

export function rateCard(cardId, known) {
  state.cards[cardId] = known ? Math.min(cardLevel(cardId) + 1, MAX_CARD_LEVEL) : 0;
  countActivity();
  save();
}

export const isCardMastered = (cardId) => cardLevel(cardId) >= 2;

export function recordExam(result) {
  state.exams = [result, ...state.exams].slice(0, 20);
  save();
}

export const exams = () => state.exams;

export const todayCount = () => state.days[dayKey()] || 0;

export function streak() {
  let count = 0;
  let time = Date.now();
  if (!state.days[dayKey(time)]) time -= DAY_MS;
  while (state.days[dayKey(time)]) {
    count++;
    time -= DAY_MS;
  }
  return count;
}

export function setLastVisit(moduleId, tab) {
  state.last = { moduleId, tab };
  save();
}

export const lastVisit = () => state.last;

export const nickname = () => state.nickname || "";

export function setNickname(value) {
  state.nickname = value;
  save();
}

export function profileSnapshot() {
  const answers = Object.values(state.answers);
  return {
    nickname: nickname(),
    streak: streak(),
    answered: answers.reduce((sum, a) => sum + a.ok + a.bad, 0),
    bestExam: Math.max(0, ...state.exams.map((e) => Math.round((e.correct / e.total) * 100))),
    today: todayCount(),
  };
}

export function resetProgress() {
  state = { ...emptyState(), nickname: state.nickname };
  save();
}
