// Fate Wheel math. Pure, so the component only renders and animates.
// Angles are degrees, clockwise from 12 o'clock (where the pointer sits).

import { fitsPlayers } from './night';

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

/** Games the wheel may land on, before vetoes. */
export function wheelPool(games, source, { count, countWithMaybes }) {
  if (source === 'shelf') return games;
  const n = source === 'maybes' ? countWithMaybes : count;
  return games.filter((g) => fitsPlayers(g, n));
}

const DAY = 24 * 60 * 60 * 1000;

/**
 * Weight for "favor dusty games": 1 for something played today, rising with the days since
 * the last play, capped at 6 months. Never played gets the top weight.
 */
export function dustWeight(lastPlayed, now = Date.now()) {
  if (!lastPlayed) return 7;
  const days = Math.max(0, (now - new Date(lastPlayed).getTime()) / DAY);
  return 1 + Math.min(days, 180) / 30;
}

/** Weighted sample of `size` games without replacement (Efraimidis–Spirakis keys). */
export function sampleGames(games, size, weightOf, random) {
  if (games.length <= size) return games;
  return games
    .map((g) => ({ g, key: Math.pow(random(), 1 / weightOf(g)) }))
    .sort((a, b) => b.key - a.key)
    .slice(0, size)
    .map(({ g }) => g);
}

/**
 * Lays games around the wheel. Slice size is proportional to weight, so a uniformly random
 * stop angle picks each game with probability weight / total.
 * @returns {{ game: object, start: number, end: number, mid: number, sweep: number }[]}
 */
export function layoutSlices(games, weightOf = () => 1) {
  const weights = games.map(weightOf);
  const total = weights.reduce((sum, w) => sum + w, 0) || 1;
  let start = 0;
  return games.map((game, i) => {
    const sweep = (weights[i] / total) * 360;
    const slice = { game, start, end: start + sweep, mid: start + sweep / 2, sweep };
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
