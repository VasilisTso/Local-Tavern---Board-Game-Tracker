// Generated covers: the same title always gets the same cover.
// No external images; colors come from the object palette in DESIGN.md (bookcloth, jacket and sleeve hues).

const oklch = (l, c, h) => `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h})`;

const STOP_WORDS = new Set(['the', 'a', 'an', 'of', 'and', 'at', 'on', 'in', 'to', '&']);

/**
 * The twelve object hues. `l`/`c`/`h` is the base (OKLCH); `dark` means the cover is light
 * and carries dark ink. Every base holds 4.5:1 against its ink.
 */
export const COVER_COLORS = [
  { id: 'vermilion', label: 'Vermilion', l: 0.52, c: 0.17, h: 32, dark: false },
  { id: 'oxblood', label: 'Oxblood', l: 0.38, c: 0.12, h: 22, dark: false },
  { id: 'coral', label: 'Coral', l: 0.8, c: 0.1, h: 30, dark: true },
  { id: 'ochre', label: 'Ochre', l: 0.66, c: 0.13, h: 70, dark: true },
  { id: 'mustard', label: 'Mustard', l: 0.82, c: 0.14, h: 90, dark: true },
  { id: 'sage', label: 'Sage', l: 0.78, c: 0.06, h: 140, dark: true },
  { id: 'bottle', label: 'Bottle green', l: 0.4, c: 0.09, h: 160, dark: false },
  { id: 'teal', label: 'Teal', l: 0.46, c: 0.075, h: 200, dark: false },
  { id: 'cobalt', label: 'Cobalt', l: 0.45, c: 0.15, h: 262, dark: false },
  { id: 'slate', label: 'Slate', l: 0.42, c: 0.04, h: 245, dark: false },
  { id: 'plum', label: 'Plum', l: 0.4, c: 0.12, h: 340, dark: false },
  { id: 'walnut', label: 'Walnut', l: 0.42, c: 0.07, h: 55, dark: false },
];

/** v2 color ids that are no longer in the palette, mapped to their closest new hue. */
const LEGACY_COLORS = {
  brick: 'vermilion',
  amber: 'ochre',
  olive: 'sage',
  moss: 'bottle',
  verdigris: 'teal',
  heather: 'plum',
};

const COLOR_BY_ID = new Map(COVER_COLORS.map((color) => [color.id, color]));

/** A known cover color id (old v2 ids are mapped), or null (null means "pick from the title"). */
export function toCoverColor(value) {
  if (typeof value !== 'string') return null;
  const id = LEGACY_COLORS[value] ?? value;
  return COLOR_BY_ID.has(id) ? id : null;
}

/** Swatch fill for a color id: the base itself. */
export function swatchFor(colorId) {
  const color = COLOR_BY_ID.get(colorId);
  return color ? oklch(color.l, color.c, color.h) : null;
}

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

export const COVER_ORNAMENTS = ['bands', 'frame', 'corner', 'sun', 'stripes'];

/**
 * Cover recipe for a title. `colorId` (from COVER_COLORS) overrides the hue the title would get.
 * Lightness only moves away from the ink, so contrast never drops below the palette's 4.5:1.
 * @returns {{ base: string, spine: string, band: string, ink: string, darkInk: boolean,
 *   monogram: string, ornament: string, seed: number }}
 */
export function coverFor(title = '', colorId = null) {
  const key = title.trim().toLowerCase();
  const hash = hashString(key);
  const color = COLOR_BY_ID.get(toCoverColor(colorId)) ?? COVER_COLORS[hash % COVER_COLORS.length];
  const { c, h, dark } = color;
  const shift = ((hash >>> 8) % 4) * 0.01; // 0–0.03
  const l = dark ? color.l + shift : color.l - shift;
  return {
    base: oklch(l, c, h),
    spine: oklch(l - 0.08, c * 0.95, h),
    band: dark
      ? oklch(Math.max(l - 0.42, 0.24), c * 0.9, (h + 18) % 360)
      : oklch(Math.min(l + 0.34, 0.88), c * 0.7, (h + 18) % 360),
    ink: dark ? oklch(0.22, 0.03, 55) : oklch(0.96, 0.02, 85),
    darkInk: dark,
    monogram: monogram(title),
    ornament: COVER_ORNAMENTS[(hash >>> 16) % COVER_ORNAMENTS.length],
    seed: hash,
  };
}

/**
 * Front aspect ratio (width / height) per kind and format, from the real objects.
 * Records are wider than square because the disc peeks out of the sleeve.
 */
const FRONT_ASPECT = {
  'board:box': 1,
  'board:card': 3 / 4,
  'video:disc': 5 / 7,
  'video:cartridge': 9 / 10,
  'video:digital': 2 / 3,
  'book:print': 2 / 3,
  'book:ebook': 5 / 7,
  'book:audio': 1,
  'film:bluray': 4 / 5,
  'film:dvd': 5 / 7,
  'film:digital': 2 / 3,
  'film:series': 4 / 5,
  'music:vinyl': 29 / 25,
  'music:cd': 8 / 7,
  'music:digital': 1,
};

export const frontAspect = (kind, format) => FRONT_ASPECT[`${kind}:${format}`] ?? 1;

/** CSS width for an item's front that fits a `maxWidth` × `maxHeight` box (any CSS lengths). */
export const frontWidth = (item, maxWidth, maxHeight = maxWidth) =>
  `min(${maxWidth}, calc(${maxHeight} * ${frontAspect(item.kind, item.format)}))`;

/**
 * Natural spine size in rem ({ width, height }) for the shelf. Print books get thicker with
 * their page count and vary a little in height; everything else follows its real case.
 * Width never drops below 1.75rem (28px), the minimum spine target in DESIGN.md.
 */
export function spineSize({ kind, format, title = '', length = null }) {
  const hash = hashString(title.trim().toLowerCase());
  switch (`${kind}:${format}`) {
    case 'book:print': {
      const pages = length ?? 320;
      return {
        width: Math.min(Math.max(1.75, 1.25 + pages / 260), 3.75),
        height: 8.75 + ((hash >>> 4) % 6) * 0.35,
      };
    }
    case 'board:box':
      return { width: 2.75 + ((hash >>> 4) % 3) * 0.5, height: 10.5 };
    case 'board:card':
      return { width: 2.25, height: 7.25 };
    case 'film:series':
      return { width: 3.5, height: 9.5 };
    case 'music:vinyl':
      return { width: 1.75, height: 11.5 };
    case 'music:cd':
      return { width: 1.75, height: 7.5 };
    case 'film:bluray':
      return { width: 1.75, height: 8.75 };
    case 'video:cartridge':
      return { width: 1.75, height: 9 };
    default:
      return { width: 1.75, height: 9.75 };
  }
}
