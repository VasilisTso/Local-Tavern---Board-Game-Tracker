// Shelf filtering and sorting. Pure functions so the Tonight tab can reuse them.
import { fitsPlayers } from './night';

export const PLAYER_OPTIONS = ['any', 'tonight', '1', '2', '3', '4', '5', '6+'];

export const TIME_BUCKETS = [
  { id: 'any', label: 'Any', test: () => true },
  { id: 'quick', label: '≤ 30 min', test: (m) => m != null && m <= 30 },
  { id: 'hour', label: '≤ 1 h', test: (m) => m != null && m <= 60 },
  { id: 'evening', label: '1–2 h', test: (m) => m != null && m > 60 && m <= 120 },
  { id: 'long', label: '2 h +', test: (m) => m != null && m > 120 },
];

export const SORTS = [
  { id: 'title', label: 'Title A–Z' },
  { id: 'dusty', label: 'Least recently played' },
  { id: 'most', label: 'Most played' },
  { id: 'added', label: 'Recently added' },
  { id: 'short', label: 'Shortest first' },
  { id: 'long', label: 'Longest first' },
];

export const DEFAULT_FILTERS = { query: '', players: 'any', time: 'any', tags: [], sort: 'title' };

export function isFiltered(filters) {
  return (
    filters.query.trim() !== '' ||
    filters.players !== 'any' ||
    filters.time !== 'any' ||
    filters.tags.length > 0
  );
}

/** Tags across the shelf, most used first. */
export function tagsByUse(games) {
  const counts = new Map();
  for (const g of games) for (const t of g.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag, count]) => ({ tag, count }));
}

const fold = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export function matchesFilters(game, filters, { tonightCount }) {
  const query = fold(filters.query.trim());
  if (query && !fold(game.title).includes(query) && !game.tags.some((t) => fold(t).includes(query))) {
    return false;
  }

  const { players } = filters;
  if (players === 'tonight' && !fitsPlayers(game, tonightCount)) return false;
  if (players === '6+' && game.maxPlayers < 6) return false;
  if (/^\d$/.test(players) && !fitsPlayers(game, Number(players))) return false;

  const bucket = TIME_BUCKETS.find((b) => b.id === filters.time) ?? TIME_BUCKETS[0];
  if (!bucket.test(game.playtime)) return false;

  if (filters.tags.length && !filters.tags.some((t) => game.tags.includes(t))) return false;
  return true;
}

const byTitle = (a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });

export function sortGames(games, sort, playStats) {
  const stat = (g) => playStats.get(g.id) ?? { count: 0, last: null };
  const list = [...games];
  switch (sort) {
    case 'dusty':
      // Never played first, then oldest last play.
      return list.sort((a, b) => {
        const la = stat(a).last ?? '';
        const lb = stat(b).last ?? '';
        return la === lb ? byTitle(a, b) : la < lb ? -1 : 1;
      });
    case 'most':
      return list.sort((a, b) => stat(b).count - stat(a).count || byTitle(a, b));
    case 'added':
      return list.sort((a, b) => (b.addedAt ?? '').localeCompare(a.addedAt ?? '') || byTitle(a, b));
    case 'short':
      return list.sort((a, b) => (a.playtime ?? Infinity) - (b.playtime ?? Infinity) || byTitle(a, b));
    case 'long':
      return list.sort((a, b) => (b.playtime ?? -1) - (a.playtime ?? -1) || byTitle(a, b));
    default:
      return list.sort(byTitle);
  }
}
