// Per-game play history derived from the play log.

/** Map of gameId -> { count, last } where `last` is the latest play date string. */
export function playStatsByGame(plays = []) {
  const stats = new Map();
  for (const play of plays) {
    const entry = stats.get(play.gameId) ?? { count: 0, last: null };
    entry.count += 1;
    if (!entry.last || play.date > entry.last) entry.last = play.date;
    stats.set(play.gameId, entry);
  }
  return stats;
}
