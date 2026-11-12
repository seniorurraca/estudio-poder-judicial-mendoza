const NICKNAME = /^[\p{L}\p{N} _.-]{2,20}$/u;
const TOKEN = /^[a-f0-9-]{36}$/;
const MAX_COUNT = 100_000;

const boundedInt = (value, max) => Number.isInteger(value) && value >= 0 && value <= max;

export const validToken = (token) => TOKEN.test(token ?? "");

export function parsePlayer(body) {
  const nickname = String(body?.nickname ?? "").trim().replace(/\s+/g, " ");
  if (!NICKNAME.test(nickname)) return { error: "Apodo inválido: 2 a 20 letras o números." };
  const { streak, answered, bestExam, today } = body;
  const numbersOk =
    boundedInt(streak, 3650) && boundedInt(answered, MAX_COUNT) && boundedInt(bestExam, 100) && boundedInt(today, MAX_COUNT);
  if (!numbersOk) return { error: "Datos de progreso inválidos." };
  return { player: { nickname, streak, answered, bestExam, today } };
}
