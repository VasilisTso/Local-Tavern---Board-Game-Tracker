// Picker wheel math. Pure, so the component only renders and animates.
// Angles are degrees, clockwise from 12 o'clock (where the pointer sits).

import { fitsPlayers } from './night';
import { isKind, lengthUnit } from './kinds';

export const MAX_SLICES = 16;

/** Small seeded PRNG (mulberry32) so a sample stays put across renders. */
export function seededRandom(seed) {
  let a = Math.floor(seed * 2 ** 32) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- pool ----------

/** Which statuses the wheel draws from. Backlog by default: things owned but not started. */
export const PICK_STATUSES = [
  { id: 'backlog', label: 'Not started', statuses: ['backlog'] },
  { id: 'active', label: 'In progress', statuses: ['active'] },
  { id: 'open', label: 'Either', title: 'Not started or in progress', statuses: ['backlog', 'active'] },
  { id: 'owned', label: 'Anything owned', title: 'Everything except the wishlist', statuses: ['backlog', 'active', 'done', 'dropped'] },
];

/** Time budgets in minutes. Unknown lengths always fit. */
export const TIME_BUDGETS = [
  { id: 'any', label: 'Any length' },
  { id: '30', label: '30 min', max: 30 },
  { id: '60', label: '1 hour', max: 60 },
  { id: '120', label: '2 hours', max: 120 },
  { id: '240', label: 'An evening', title: 'Up to 4 hours', max: 240 },
];

/** Player-count source in game night mode. */
export const NIGHT_SOURCES = ['fits', 'maybes', 'any'];

/** Rough reading pace for books measured in pages. */
export const MINUTES_PER_PAGE = 1.5;

export const DEFAULT_PICK = {
  kinds: [],
  location: 'any',
  status: 'backlog',
  budget: 'any',
  tags: [],
  favorNeglected: true,
  nightMode: false,
  nightSource: 'fits',
};

const oneOf = (list, value, fallback) => (list.includes(value) ? value : fallback);
const strings = (value) => (Array.isArray(value) ? [...new Set(value.filter((v) => typeof v === 'string' && v))] : []);

/** Cleans stored Pick settings (`tavern:v3:pick`). Unknown kinds are dropped; a removed place resets to "any" at use time. */
export function normalizePick(stored) {
  if (!stored || typeof stored !== 'object') return null;
  return {
    kinds: strings(stored.kinds).filter(isKind),
    location: typeof stored.location === 'string' && stored.location ? stored.location : 'any',
    status: oneOf(PICK_STATUSES.map((s) => s.id), stored.status, DEFAULT_PICK.status),
    budget: oneOf(TIME_BUDGETS.map((b) => b.id), stored.budget, DEFAULT_PICK.budget),
    tags: strings(stored.tags),
    favorNeglected: stored.favorNeglected !== false,
    nightMode: stored.nightMode === true,
    nightSource: oneOf(NIGHT_SOURCES, stored.nightSource, DEFAULT_PICK.nightSource),
  };
}

export const defaultPick = () => ({ ...DEFAULT_PICK });

/** Same settings with the pool filters back to their defaults (night mode and weighting kept). */
export const clearPickFilters = (pick) => ({
  ...pick,
  kinds: DEFAULT_PICK.kinds,
  location: DEFAULT_PICK.location,
  status: DEFAULT_PICK.status,
  budget: DEFAULT_PICK.budget,
  tags: DEFAULT_PICK.tags,
});

/** Estimated minutes for an item, converting pages at a reading pace. Null when unknown. */
export function itemMinutes(item) {
  if (item.length == null) return null;
  return lengthUnit(item.kind, item.format) === 'pages' ? item.length * MINUTES_PER_PAGE : item.length;
}

/** Filters (other than night mode's player count) that narrow the pool, for the "N filters" hint. */
export function pickFilterCount(pick) {
  return (
    (pick.kinds.length > 0) +
    (pick.location !== 'any') +
    (pick.status !== DEFAULT_PICK.status) +
    (pick.budget !== 'any') +
    (pick.tags.length > 0)
  );
}

/**
 * Items the wheel may land on, before skips.
 * @param {object[]} items
 * @param {typeof DEFAULT_PICK} pick
 * @param {{ players?: number | null }} [opts] game night: only items that seat this many
 */
export function wheelPool(items, pick, { players = null } = {}) {
  const statuses = (PICK_STATUSES.find((s) => s.id === pick.status) ?? PICK_STATUSES[0]).statuses;
  const budget = TIME_BUDGETS.find((b) => b.id === pick.budget)?.max ?? null;
  return items.filter((item) => {
    if (!statuses.includes(item.status)) return false;
    if (pick.kinds.length && !pick.kinds.includes(item.kind)) return false;
    if (pick.location !== 'any' && item.locationId !== pick.location) return false;
    if (pick.tags.length && !pick.tags.some((t) => item.tags.includes(t))) return false;
    if (budget != null) {
      const minutes = itemMinutes(item);
      if (minutes != null && minutes > budget) return false;
    }
    if (players != null && !fitsPlayers(item, players)) return false;
    return true;
  });
}

const DAY = 24 * 60 * 60 * 1000;
const daysSince = (date, now) => (date ? Math.max(0, (now - new Date(date).getTime()) / DAY) : 0);

/**
 * Weight for "favor what's been neglected", 1 to 7. Something used today weighs 1, rising with
 * the days since the last use (capped at six months). Never used weighs 4 to 7, more the longer
 * it has sat in the library.
 */
export function neglectWeight(item, lastUsed, now = Date.now()) {
  if (lastUsed) return 1 + Math.min(daysSince(lastUsed, now), 180) / 30;
  const age = item?.addedAt ? daysSince(item.addedAt, now) : 180;
  return 4 + Math.min(age, 180) / 60;
}

/** Weighted sample of `size` items without replacement (Efraimidis–Spirakis keys). */
export function sampleItems(items, size, weightOf, random) {
  if (items.length <= size) return items;
  return items
    .map((item) => ({ item, key: Math.pow(random(), 1 / weightOf(item)) }))
    .sort((a, b) => b.key - a.key)
    .slice(0, size)
    .map(({ item }) => item);
}

/**
 * Lays items around the wheel. Slice size is proportional to weight, so a uniformly random
 * stop angle picks each item with probability weight / total.
 * @returns {{ item: object, start: number, end: number, mid: number, sweep: number }[]}
 */
export function layoutSlices(items, weightOf = () => 1) {
  const weights = items.map(weightOf);
  const total = weights.reduce((sum, w) => sum + w, 0) || 1;
  let start = 0;
  return items.map((item, i) => {
    const sweep = (weights[i] / total) * 360;
    const slice = { item, start, end: start + sweep, mid: start + sweep / 2, sweep };
    start += sweep;
    return slice;
  });
}

const norm = (deg) => ((deg % 360) + 360) % 360;

/** Slice index under the pointer when the wheel is rotated `rotation` degrees clockwise. */
export function sliceIndexAt(slices, rotation) {
  if (!slices.length) return -1;
  const a = norm(-rotation);
  const i = slices.findIndex((s) => a >= s.start && a < s.end);
  return i === -1 ? slices.length - 1 : i;
}

/** Final rotation for a spin from `current`: several full turns plus a random stop. */
export function spinTarget(current, random = Math.random) {
  const turns = 5 + Math.floor(random() * 3);
  return current + turns * 360 + random() * 360;
}

/** Point on a circle of radius r around (cx, cy) at a clockwise-from-top angle. */
export function polar(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

/** SVG path for a ring sector between radii r0 and r1. */
export function sectorPath(cx, cy, r0, r1, start, end) {
  if (end - start >= 359.999) {
    // Full ring: two half arcs (a single 360° arc collapses).
    const ring = (r) => `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`;
    return r0 > 0 ? `${ring(r1)} ${ring(r0)}` : ring(r1);
  }
  const large = end - start > 180 ? 1 : 0;
  const [x1, y1] = polar(cx, cy, r1, start);
  const [x2, y2] = polar(cx, cy, r1, end);
  if (r0 <= 0) return `M ${cx} ${cy} L ${x1} ${y1} A ${r1} ${r1} 0 ${large} 1 ${x2} ${y2} Z`;
  const [x3, y3] = polar(cx, cy, r0, end);
  const [x4, y4] = polar(cx, cy, r0, start);
  return `M ${x1} ${y1} A ${r1} ${r1} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${r0} ${r0} 0 ${large} 0 ${x4} ${y4} Z`;
}

/** Shortens a title to roughly `max` characters on a word boundary when possible. */
export function clipLabel(title, max) {
  if (title.length <= max) return title;
  const cut = title.slice(0, Math.max(1, max - 1));
  const space = cut.lastIndexOf(' ');
  return `${(space > max * 0.5 ? cut.slice(0, space) : cut).replace(/[\s:,–-]+$/, '')}…`;
}

/** Word-wraps a title into at most `lines` lines of ~`max` characters; the last line is clipped. */
export function wrapLabel(title, max, lines = 1) {
  if (lines <= 1 || title.length <= max) return [clipLabel(title, max)];
  const words = title.split(/\s+/);
  const out = [];
  let line = '';
  while (words.length && out.length < lines - 1) {
    const next = line ? `${line} ${words[0]}` : words[0];
    if (next.length <= max || !line) {
      line = next;
      words.shift();
    } else {
      out.push(line);
      line = '';
    }
  }
  const rest = [line, ...words].filter(Boolean).join(' ');
  if (rest) out.push(clipLabel(rest, max));
  return out;
}
