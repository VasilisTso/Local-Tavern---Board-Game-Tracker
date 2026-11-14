// Media kinds and formats: labels, icons, and which item fields each kind uses.
// Pure metadata, shared by storage (validation), the item dialog, filters and covers.

import {
  BookOpen,
  Box,
  Clapperboard,
  Cloud,
  Dices,
  Disc3,
  Gamepad2,
  Headphones,
  Joystick,
  Layers,
  Music,
  Spade,
  Tablet,
  Tv,
} from 'lucide-react';

/**
 * `fields`: optional item fields this kind shows (title, kind, format, status, rating,
 * location, tags, cover, lentTo and notes are common to every kind).
 * `length`: what the length number means for the kind, per format when it differs.
 * `renderer`: which cover component draws it (components/covers/).
 */
export const KINDS = [
  {
    id: 'board',
    label: 'Board game',
    plural: 'Board games',
    icon: Dices,
    creatorLabel: 'Designer',
    fields: ['creator', 'year', 'length', 'players'],
    lengthUnit: 'min',
    renderer: 'BoardBox',
    formats: [
      { id: 'box', label: 'Boxed game', icon: Box },
      { id: 'card', label: 'Card game', icon: Spade },
    ],
  },
  {
    id: 'video',
    label: 'Video game',
    plural: 'Video games',
    icon: Gamepad2,
    creatorLabel: 'Studio',
    fields: ['creator', 'year', 'length', 'players', 'platform'],
    lengthUnit: 'min',
    renderer: 'GameCase',
    formats: [
      { id: 'disc', label: 'Disc', icon: Disc3 },
      { id: 'cartridge', label: 'Cartridge', icon: Joystick },
      { id: 'digital', label: 'Digital', icon: Cloud },
    ],
  },
  {
    id: 'book',
    label: 'Book',
    plural: 'Books',
    icon: BookOpen,
    creatorLabel: 'Author',
    fields: ['creator', 'year', 'length'],
    lengthUnit: 'min',
    lengthUnitByFormat: { print: 'pages', ebook: 'pages' },
    renderer: 'Book',
    formats: [
      { id: 'print', label: 'Print', icon: BookOpen },
      { id: 'ebook', label: 'Ebook', icon: Tablet },
      { id: 'audio', label: 'Audiobook', icon: Headphones },
    ],
  },
  {
    id: 'film',
    label: 'Film or series',
    plural: 'Films and series',
    icon: Clapperboard,
    creatorLabel: 'Director',
    fields: ['creator', 'year', 'length'],
    lengthUnit: 'min',
    renderer: 'FilmCase',
    formats: [
      { id: 'bluray', label: 'Blu-ray', icon: Disc3 },
      { id: 'dvd', label: 'DVD', icon: Disc3 },
      { id: 'digital', label: 'Digital', icon: Cloud },
      { id: 'series', label: 'Series box set', icon: Tv },
    ],
  },
  {
    id: 'music',
    label: 'Music',
    plural: 'Music',
    icon: Music,
    creatorLabel: 'Artist',
    fields: ['creator', 'year', 'length'],
    lengthUnit: 'min',
    renderer: 'Record',
    formats: [
      { id: 'vinyl', label: 'Vinyl', icon: Disc3 },
      { id: 'cd', label: 'CD', icon: Disc3 },
      { id: 'digital', label: 'Digital', icon: Cloud },
    ],
  },
];

export const KIND_IDS = KINDS.map((k) => k.id);
export const DEFAULT_KIND = 'board';

const KIND_BY_ID = new Map(KINDS.map((k) => [k.id, k]));

/** Kind metadata, falling back to board games for unknown ids. */
export const kindMeta = (kind) => KIND_BY_ID.get(kind) ?? KIND_BY_ID.get(DEFAULT_KIND);

export const isKind = (value) => KIND_BY_ID.has(value);

/** Format metadata for a kind; the kind's first format when the id does not belong to it. */
export function formatMeta(kind, format) {
  const { formats } = kindMeta(kind);
  return formats.find((f) => f.id === format) ?? formats[0];
}

export const isFormatOf = (kind, format) => kindMeta(kind).formats.some((f) => f.id === format);

/** True when items of this kind use the optional field (`creator`, `year`, `length`, `players`, `platform`). */
export const kindHasField = (kind, field) => kindMeta(kind).fields.includes(field);

/** `'pages'` or `'min'`: what `item.length` counts for this kind and format. */
export function lengthUnit(kind, format) {
  const meta = kindMeta(kind);
  return meta.lengthUnitByFormat?.[format] ?? meta.lengthUnit;
}

/** Physical copies can be lent out and stand on a shelf; digital ones live in an app or account. */
export const isDigitalFormat = (format) => format === 'digital' || format === 'ebook' || format === 'audio';

export const STATUSES = [
  { id: 'backlog', label: 'Not started' },
  { id: 'active', label: 'In progress' },
  { id: 'done', label: 'Finished' },
  { id: 'dropped', label: 'Dropped' },
  { id: 'wishlist', label: 'Wishlist' },
];

export const STATUS_IDS = STATUSES.map((s) => s.id);
export const DEFAULT_STATUS = 'backlog';
export const statusLabel = (id) => STATUSES.find((s) => s.id === id)?.label ?? STATUSES[0].label;

export const LOCATION_KINDS = [
  { id: 'physical', label: 'Physical place', icon: Layers },
  { id: 'digital', label: 'App or account', icon: Cloud },
];

export const ACTIVITY_TYPES = [
  { id: 'session', label: 'Session' },
  { id: 'started', label: 'Started' },
  { id: 'finished', label: 'Finished' },
];

export const ACTIVITY_TYPE_IDS = ACTIVITY_TYPES.map((t) => t.id);

export const MAX_RATING = 5;
