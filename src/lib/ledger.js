// Play log helpers: grouping, names and stats. Pure; play dates are local `YYYY-MM-DDTHH:mm`.

import { playStatsByGame } from './plays';

const byDateDesc = (a, b) => (a.date === b.date ? 0 : a.date < b.date ? 1 : -1);

/** Plays newest first, grouped by calendar month: `[{ key: 'YYYY-MM', label, plays }]`. */
export function groupByMonth(plays, now = new Date()) {
  const groups = [];
  for (const play of [...plays].sort(byDateDesc)) {
    const key = play.date.slice(0, 7);
    let group = groups.at(-1);
    if (!group || group.key !== key) {
      const [y, m] = key.split('-').map(Number);
      const opts = { month: 'long' };
      if (y !== now.getFullYear()) opts.year = 'numeric';
      const label = Number.isFinite(y) && Number.isFinite(m)
        ? new Date(y, m - 1, 1).toLocaleDateString(undefined, opts)
        : 'Undated';
      group = { key, label, plays: [] };
      groups.push(group);
    }
    group.plays.push(play);
  }
  return groups;
}

const fold = (name) => name.trim().toLowerCase();

/**
 * Names to offer in the log dialog: tonight's going guests, then maybes, then the rest of
 * the guest list, then everyone from past plays (most frequent first). Deduped, case-insensitive.
 */
export function knownPlayerNames(night, plays) {
  const seen = new Set();
  const out = [];
  const push = (name) => {
    const key = fold(name);
    if (!key || seen.has(key)) return;
    seen.add(key);
    out.push(name.trim());
  };
  const guests = night?.guests ?? [];
  for (const status of ['going', 'maybe', 'not-going']) {
    guests.filter((g) => g.status === status).forEach((g) => push(g.name));
  }
  const counts = new Map();
  for (const play of plays) {
    for (const name of play.players) {
      const key = fold(name);
      const entry = counts.get(key) ?? { name, count: 0 };
      entry.count += 1;
      counts.set(key, entry);
    }
  }
  [...counts.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)).forEach((e) => push(e.name));
  return out;
}

const DAY = 24 * 60 * 60 * 1000;

/** Whole days between a local date string and now (never negative). */
export function daysSince(date, now = Date.now()) {
  const t = new Date(date).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.floor((now - t) / DAY));
}

/** "today", "3 days ago", "5 weeks ago", "8 months ago", "2 years ago". */
export function agoLabel(days) {
  if (days == null) return '';
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.round(days / 7)} weeks ago`;
  if (days < 730) return `${Math.round(days / 30.4)} months ago`;
  return `${Math.round(days / 365)} years ago`;
}

/**
 * Everything the stats panel shows.
 * @returns {{
 *   plays: number, nights: number, gamesPlayed: number, avgPlaytime: number | null,
 *   mostPlayed: { game: object, count: number }[],
 *   winners: { name: string, wins: number, played: number }[],
 *   dusty: { game: object, last: string | null }[],
 * }}
 */
export function ledgerStats(plays, games, { top = 5, now = Date.now() } = {}) {
  const gameById = new Map(games.map((g) => [g.id, g]));
  const byGame = playStatsByGame(plays);

  const nights = new Set(plays.map((p) => p.date.slice(0, 10))).size;

  const timed = plays.map((p) => gameById.get(p.gameId)?.playtime).filter((t) => t != null);
  const avgPlaytime = timed.length ? Math.round(timed.reduce((s, t) => s + t, 0) / timed.length) : null;

  const mostPlayed = [...byGame.entries()]
    .filter(([id]) => gameById.has(id))
    .map(([id, s]) => ({ game: gameById.get(id), count: s.count, last: s.last }))
    .sort((a, b) => b.count - a.count || (b.last ?? '').localeCompare(a.last ?? '') || a.game.title.localeCompare(b.game.title))
    .slice(0, top);

  // Win leaderboard: names are matched case-insensitively, shown as first written.
  const people = new Map();
  const person = (name) => {
    const key = fold(name);
    if (!people.has(key)) people.set(key, { name: name.trim(), wins: 0, played: 0 });
    return people.get(key);
  };
  for (const play of plays) {
    const winners = new Set(play.winners.map(fold));
    for (const name of play.players) {
      const p = person(name);
      p.played += 1;
      if (winners.has(fold(name))) p.wins += 1;
    }
    // A winner not listed as a player still counts as having played that game.
    for (const name of play.winners) {
      if (!play.players.some((n) => fold(n) === fold(name))) {
        const p = person(name);
        p.played += 1;
        p.wins += 1;
      }
    }
  }
  const winners = [...people.values()]
    .filter((p) => p.wins > 0)
    .sort((a, b) => b.wins - a.wins || a.played - b.played || a.name.localeCompare(b.name))
    .slice(0, top);

  // Gathering dust: never played first (oldest added first), then the longest since last play.
  const dusty = games
    .map((game) => ({ game, last: byGame.get(game.id)?.last ?? null }))
    .sort((a, b) => {
      if (!a.last && !b.last) return (a.game.addedAt ?? '').localeCompare(b.game.addedAt ?? '') || a.game.title.localeCompare(b.game.title);
      if (!a.last) return -1;
      if (!b.last) return 1;
      return a.last.localeCompare(b.last);
    })
    .slice(0, top)
    .map((entry) => ({ ...entry, days: entry.last ? daysSince(entry.last, now) : null }));

  return {
    plays: plays.length,
    nights,
    gamesPlayed: [...byGame.keys()].filter((id) => gameById.has(id)).length,
    avgPlaytime,
    mostPlayed,
    winners,
    dusty,
  };
}
