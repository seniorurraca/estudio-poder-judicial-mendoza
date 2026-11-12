import m1 from "../data/m1.js";
import m2 from "../data/m2.js";
import m3 from "../data/m3.js";
import m4 from "../data/m4.js";
import m5 from "../data/m5.js";
import s1 from "../data/studio/m1.js";
import s2 from "../data/studio/m2.js";
import s3 from "../data/studio/m3.js";
import s4 from "../data/studio/m4.js";
import s5 from "../data/studio/m5.js";

const STUDIO = [s1, s2, s3, s4, s5];

export const MODULES = [m1, m2, m3, m4, m5].map((m, i) => ({ ...m, ...STUDIO[i] }));

export const NOTEBOOK_URL = "https://notebook.google.com/notebook/d27cdf7f-a020-4be3-b2b8-52c674964cd8";

export const QUESTIONS = MODULES.flatMap((m) =>
  m.questions.map((q, i) => ({ ...q, id: `${m.id}-q${i}`, moduleId: m.id }))
);

export const CARDS = MODULES.flatMap((m) =>
  m.cards.map((c, i) => ({ ...c, id: `${m.id}-c${i}`, moduleId: m.id }))
);

export const moduleById = (id) => MODULES.find((m) => m.id === id);

export const questionsOf = (moduleId) => QUESTIONS.filter((q) => q.moduleId === moduleId);

export const cardsOf = (moduleId) => CARDS.filter((c) => c.moduleId === moduleId);

export const EXAM = { questions: 50, minutes: 40, options: 4 };
