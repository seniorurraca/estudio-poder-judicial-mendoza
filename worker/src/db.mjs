const LEADERBOARD_SIZE = 50;

export async function addVisit(db, day) {
  await db
    .prepare("INSERT INTO visits (day, count) VALUES (?1, 1) ON CONFLICT (day) DO UPDATE SET count = count + 1")
    .bind(day)
    .run();
}

export async function nicknameTaken(db, nickname, playerId) {
  const row = await db
    .prepare("SELECT id FROM players WHERE nickname = ?1 COLLATE NOCASE AND id != ?2")
    .bind(nickname, playerId)
    .first();
  return Boolean(row);
}

export async function upsertPlayer(db, player) {
  await db
    .prepare(
      `INSERT INTO players (id, nickname, streak, answered, best_exam, today_count, last_day, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?7)
       ON CONFLICT (id) DO UPDATE SET nickname = ?2, streak = ?3, answered = ?4, best_exam = ?5, today_count = ?6, last_day = ?7`
    )
    .bind(player.id, player.nickname, player.streak, player.answered, player.bestExam, player.today, player.day)
    .run();
}

export async function readStats(db, day) {
  const [visits, players, leaderboard] = await db.batch([
    db.prepare("SELECT COALESCE(SUM(count), 0) AS total, COALESCE(SUM(CASE WHEN day = ?1 THEN count END), 0) AS today FROM visits").bind(day),
    db.prepare("SELECT COUNT(*) AS total, COALESCE(SUM(last_day = ?1), 0) AS today FROM players").bind(day),
    db
      .prepare(
        `SELECT nickname, streak, answered, best_exam AS bestExam,
                CASE WHEN last_day = ?1 THEN today_count ELSE 0 END AS today
         FROM players ORDER BY streak DESC, answered DESC, best_exam DESC LIMIT ?2`
      )
      .bind(day, LEADERBOARD_SIZE),
  ]);
  return {
    visits: visits.results[0],
    players: players.results[0],
    leaderboard: leaderboard.results,
  };
}
