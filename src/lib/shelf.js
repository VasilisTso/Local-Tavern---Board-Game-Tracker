// Library filtering, sorting and grouping. Pure functions so Pick can reuse them.
import { fitsPlayers } from './night';
import { STATUSES, kindHasField, kindMeta, lengthUnit } from './kinds';

export const VIEWS = [
  { id: 'shelf', label: 'Shelf' },
  { id: 'grid', label: 'Grid' },
  { id: 'list', label: 'List' },
];
export const DEFAULT_VIEW = 'shelf';
export const normalizeView = (value) => (VIEWS.some((v) => v.id === value) ? value : null);

export const PLAYER_OPTIONS = ['any', '1', '2', '3', '4', '5', '6+'];

/**
 * Length buckets. Pages and minutes mean different things, so each bucket has a limit per unit.
 * `max` is inclusive; the last bucket has no upper limit.
 */
export const LENGTH_BUCKETS = [
  { id: 'any', label: 'Any' },
  { id: 'short', label: 'Short', title: 'Up to 1 hour, or up to 200 pages', max: { min: 60, pages: 200 } },
  { id: 'medium', label: 'Medium', title: '1 to 3 hours, or 201 to 400 pages', max: { min: 180, pages: 400 } },
  { id: 'long', label: 'Long', title: 'Over 3 hours, or over 400 pages' },
];

function lengthBucket(item) {
  if (item.length == null) return null;
  const unit = lengthUnit(item.kind, item.format) === 'pages' ? 'pages' : 'min';
  return LENGTH_BUCKETS.find((b) => b.max && item.length <= b.max[unit])?.id ?? 'long';
}

export const SORTS = [
  { id: 'title', label: 'Title A–Z' },
  { id: 'creator', label: 'Creator A–Z' },
  { id: 'added', label: 'Recently added' },
  { id: 'dusty', label: 'Least recently used' },
  { id: 'most', label: 'Most used' },
  { id: 'rating', label: 'Highest rated' },
  { id: 'year', label: 'Newest first' },
];

/** `location`: 'any', a location id, or 'none' (no place, or a removed one). */
export const DEFAULT_FILTERS = {
  query: '',
  kinds: [],
  location: 'any',
  status: 'any',
  length: 'any',
  players: 'any',
  tags: [],
  sort: 'title',
};

/** Filters other than search and kind, which sit behind the "Filters" toggle. Counts how many are set. */
export function moreFiltersCount(filters) {
  return (
    (filters.location !== 'any') +
    (filters.status !== 'any') +
    (filters.length !== 'any') +
    (filters.players !== 'any') +
    (filters.tags.length > 0)
  );
}

export function isFiltered(filters) {
  return filters.query.trim() !== '' || filters.kinds.length > 0 || moreFiltersCount(filters) > 0;
}

export const STATUS_OPTIONS = [{ id: 'any', label: 'Any' }, ...STATUSES];

/** Tags across the library, most used first. */
export function tagsByUse(items) {
  const counts = new Map();
  for (const item of items) for (const t of item.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag, count]) => ({ tag, count }));
}

const fold = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

/** True when the item's place is gone or was never set. */
const isUnplaced = (item, locationIds) => !item.locationId || !locationIds.has(item.locationId);

/**
 * @param {object} item
 * @param {typeof DEFAULT_FILTERS} filters
 * @param {Set<string>} locationIds ids of existing locations
 */
export function matchesFilters(item, filters, locationIds) {
  const query = fold(filters.query.trim());
  if (query) {
    const haystack = [item.title, item.creator, item.platform, ...item.tags].filter(Boolean).map(fold);
    if (!haystack.some((text) => text.includes(query))) return false;
  }

  if (filters.kinds.length && !filters.kinds.includes(item.kind)) return false;

  if (filters.location === 'none') {
    if (!isUnplaced(item, locationIds)) return false;
  } else if (filters.location !== 'any' && item.locationId !== filters.location) return false;

  if (filters.status !== 'any' && item.status !== filters.status) return false;
  if (filters.length !== 'any' && lengthBucket(item) !== filters.length) return false;

  const { players } = filters;
  if (players !== 'any') {
    if (!kindHasField(item.kind, 'players')) return false;
    if (players === '6+' ? !(item.maxPlayers >= 6) : !fitsPlayers(item, Number(players))) return false;
  }

  if (filters.tags.length && !filters.tags.some((t) => item.tags.includes(t))) return false;
  return true;
}

const collator = new Intl.Collator(undefined, { sensitivity: 'base' });
const byTitle = (a, b) => collator.compare(a.title, b.title);
const surname = (creator) => creator.trim().split(/\s+/).pop() ?? '';

/**
 * @param {object[]} items
 * @param {string} sort a SORTS id
 * @param {Map<string, { count: number, last: string | null }>} useStats from `playStatsByGame`
 */
export function sortItems(items, sort, useStats) {
  const stat = (item) => useStats.get(item.id) ?? { count: 0, last: null };
  const list = [...items];
  switch (sort) {
    case 'creator':
      // Surname first, as a shelf is ordered; items without a creator go last.
      return list.sort((a, b) => {
        if (!a.creator !== !b.creator) return a.creator ? -1 : 1;
        return collator.compare(surname(a.creator), surname(b.creator)) || byTitle(a, b);
      });
    case 'dusty':
      // Never used first, then the oldest last use.
      return list.sort((a, b) => {
        const la = stat(a).last ?? '';
        const lb = stat(b).last ?? '';
        return la === lb ? byTitle(a, b) : la < lb ? -1 : 1;
      });
    case 'most':
      return list.sort((a, b) => stat(b).count - stat(a).count || byTitle(a, b));
    case 'added':
      return list.sort((a, b) => (b.addedAt ?? '').localeCompare(a.addedAt ?? '') || byTitle(a, b));
    case 'rating':
      return list.sort((a, b) => b.rating - a.rating || byTitle(a, b));
    case 'year':
      return list.sort((a, b) => (b.year ?? -Infinity) - (a.year ?? -Infinity) || byTitle(a, b));
    default:
      return list.sort(byTitle);
  }
}

export const UNPLACED_ID = 'none';

/**
 * Items grouped by place, in the order the places were made, with a trailing "No place" group
 * for items whose place is unset or removed. Places with no matching items are kept only when
 * `keepEmpty` is set (an unfiltered library shows empty places so they can be filled).
 * @returns {{ id: string, name: string, kind: 'physical' | 'digital' | null, items: object[] }[]}
 */
export function groupByLocation(items, locations, { keepEmpty = false } = {}) {
  const ids = new Set(locations.map((l) => l.id));
  const buckets = new Map(locations.map((l) => [l.id, []]));
  const unplaced = [];
  for (const item of items) {
    if (isUnplaced(item, ids)) unplaced.push(item);
    else buckets.get(item.locationId).push(item);
  }
  const groups = locations
    .map((l) => ({ id: l.id, name: l.name, kind: l.kind, items: buckets.get(l.id) }))
    .filter((g) => keepEmpty || g.items.length > 0);
  if (unplaced.length) groups.push({ id: UNPLACED_ID, name: 'No place yet', kind: null, items: unplaced });
  return groups;
}

/** Items with status "active", most recently added first. */
export const nowItems = (items) =>
  items.filter((i) => i.status === 'active').sort((a, b) => (b.addedAt ?? '').localeCompare(a.addedAt ?? ''));

/** Boxed games and vinyl stand face-out on the shelf; everything else shows its spine. */
export const standsFaceOut = (item) =>
  (item.kind === 'board' && item.format === 'box') || (item.kind === 'music' && item.format === 'vinyl');

/** "Board game · Boxed game" */
export const kindLine = (item) => {
  const meta = kindMeta(item.kind);
  const format = meta.formats.find((f) => f.id === item.format);
  return format ? `${meta.label} · ${format.label}` : meta.label;
};
