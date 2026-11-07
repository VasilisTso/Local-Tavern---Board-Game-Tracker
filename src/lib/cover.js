// Generated game-box covers: the same title always gets the same cover.
// No external images; colors come from a curated set of warm, shelf-like hues.

const STOP_WORDS = new Set(['the', 'a', 'an', 'of', 'and', 'at', 'on', 'in', 'to', '&']);

/** Curated hues (OKLCH h) with a chroma that keeps each one earthy rather than neon. */
const HUES = [
  { h: 25, c: 0.11 }, // oxblood
  { h: 40, c: 0.11 }, // brick
  { h: 55, c: 0.07 }, // walnut
  { h: 72, c: 0.1 }, // amber
  { h: 88, c: 0.09 }, // ochre
  { h: 112, c: 0.07 }, // olive
  { h: 140, c: 0.07 }, // moss
  { h: 178, c: 0.06 }, // verdigris
  { h: 232, c: 0.06 }, // slate
  { h: 290, c: 0.06 }, // heather
  { h: 335, c: 0.08 }, // plum
];

/** FNV-1a 32-bit. Stable across sessions and browsers. */
export function hashString(text) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Up to two initials from the significant words: "Ticket to Ride" -> "TR". */
export function monogram(title) {
  const words = title
    .replace(/\(.*?\)/g, ' ')
    .split(/[\s:,\-–—/]+/)
    .map((w) => w.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter(Boolean);
  const significant = words.filter((w) => !STOP_WORDS.has(w.toLowerCase()));
  const pick = significant.length ? significant : words;
  if (pick.length === 0) return '?';
  if (pick.length === 1) return pick[0].slice(0, 2).replace(/^./, (c) => c.toUpperCase());
  return (pick[0][0] + pick[1][0]).toUpperCase();
}

const oklch = (l, c, h) => `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h})`;

/**
 * Cover recipe for a title.
 * @returns {{ base: string, spine: string, band: string, ink: string, monogram: string, variant: 'bands' | 'frame' | 'corner' }}
 */
export function coverFor(title = '') {
  const key = title.trim().toLowerCase();
  const hash = hashString(key);
  const { h, c } = HUES[hash % HUES.length];
  const l = 0.4 + ((hash >>> 8) % 9) * 0.012; // 0.40–0.50: light ink stays ≥ 4.5:1
  const variants = ['bands', 'frame', 'corner'];
  return {
    base: oklch(l, c, h),
    spine: oklch(l - 0.1, c * 0.9, h),
    band: oklch(Math.min(l + 0.3, 0.86), c * 0.8, (h + 18) % 360),
    ink: oklch(0.96, 0.02, 85),
    monogram: monogram(title),
    variant: variants[(hash >>> 16) % variants.length],
  };
}
