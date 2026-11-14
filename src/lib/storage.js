// Versioned localStorage access for the library.
// Each slice lives under its own key so hooks persist independently.
// Older data (v1 `tavern_*`, v2 `tavern:v2:*`) is migrated once and left in place.

import seedItems from '../data/items.json';
import seedLocations from '../data/locations.json';
import { toCoverColor } from './cover';
import {
  ACTIVITY_TYPE_IDS,
  DEFAULT_KIND,
  DEFAULT_STATUS,
  MAX_RATING,
  STATUS_IDS,
  isFormatOf,
  isKind,
  kindHasField,
  kindMeta,
} from './kinds';

export const STORAGE_VERSION = 3;

export const KEYS = {
  meta: 'tavern:v3:meta',
  items: 'tavern:v3:items',
  locations: 'tavern:v3:locations',
  activity: 'tavern:v3:activity',
  night: 'tavern:v3:night',
  /** Library view (shelf, grid or list). */
  view: 'tavern:v3:view',
  /** Pick tab filters and game night mode. */
  pick: 'tavern:v3:pick',
  theme: 'tavern:theme',
};

/** Keys from earlier versions. Read during migration, never written or removed. */
export const LEGACY_KEYS = {
  v1Games: 'tavern_games',
  v1Rsvp: 'tavern_rsvp',
  v2Games: 'tavern:v2:games',
  v2Plays: 'tavern:v2:plays',
  v2Night: 'tavern:v2:night',
};

/** Where migrated v2 board games are shelved (a seed location). */
export const MIGRATED_LOCATION_ID = 'loc-living-room';

export const GUEST_STATUSES = ['going', 'maybe', 'not-going'];
const LEGACY_STATUS = { attending: 'going', maybe: 'maybe', declined: 'not-going' };

// ---------- low-level ----------

export function read(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false; // quota exceeded or storage blocked; state stays in memory
  }
}

export function uid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for non-secure contexts (e.g. phone on LAN over http)
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// ---------- normalizers ----------

const toInt = (value) => {
  const n = typeof value === 'number' ? value : parseInt(value, 10);
  return Number.isFinite(n) ? Math.round(n) : null;
};
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const toText = (value, max = 500) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

const toId = (value) => (typeof value === 'string' && value ? value : null);
const toTags = (list) =>
  Array.isArray(list) ? [...new Set(list.map((t) => toText(t, 40)).filter(Boolean))] : [];
const toNames = (list) =>
  Array.isArray(list) ? [...new Set(list.map((n) => toText(n, 60)).filter(Boolean))] : [];
const toRating = (value) => clamp(toInt(value) ?? 0, 0, MAX_RATING);

/** Only http(s) URLs; anything else (javascript:, data:, junk) becomes null. */
function toHttpUrl(value) {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  if (!text || text.length > 2000) return null; // reject rather than store a cut-off URL
  try {
    const url = new URL(text);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

/** Player range for kinds that have one. Board games always get a range; video games may leave it empty. */
function toPlayers(kind, rawMin, rawMax) {
  if (!kindHasField(kind, 'players')) return { minPlayers: null, maxPlayers: null };
  let min = toInt(rawMin);
  let max = toInt(rawMax);
  if (min == null && max == null && kind !== 'board') return { minPlayers: null, maxPlayers: null };
  min = clamp(min ?? max ?? 1, 1, 99);
  max = clamp(max ?? min, 1, 99);
  if (max < min) [min, max] = [max, min];
  return { minPlayers: min, maxPlayers: max };
}

/**
 * Cleans one library item. Also accepts a v1/v2 game (`playtime`, no kind), which becomes a
 * boxed board game. Fields the kind does not use are stored as null.
 */
export function normalizeItem(item, fallbackAddedAt = new Date().toISOString()) {
  if (!item || typeof item !== 'object') return null;
  const title = toText(item.title, 120);
  if (!title) return null;

  const kind = isKind(item.kind) ? item.kind : DEFAULT_KIND;
  const format = isFormatOf(kind, item.format) ? item.format : kindMeta(kind).formats[0].id;
  const has = (field) => kindHasField(kind, field);
  const length = has('length') ? toInt(item.length ?? item.playtime) : null;
  const year = has('year') ? toInt(item.year) : null;

  return {
    id: toId(item.id) ?? uid(),
    title,
    kind,
    format,
    creator: has('creator') ? toText(item.creator, 120) : '',
    year: year == null ? null : clamp(year, 1, 9999),
    locationId: toId(item.locationId),
    status: STATUS_IDS.includes(item.status) ? item.status : DEFAULT_STATUS,
    rating: toRating(item.rating),
    tags: toTags(item.tags),
    color: toCoverColor(item.color),
    coverId: toId(item.coverId),
    coverUrl: toHttpUrl(item.coverUrl),
    length: length == null ? null : clamp(length, 1, 99999),
    ...toPlayers(kind, item.minPlayers, item.maxPlayers),
    platform: has('platform') ? toText(item.platform, 40) : '',
    lentTo: toText(item.lentTo, 60),
    notes: toText(item.notes, 2000),
    addedAt: typeof item.addedAt === 'string' ? item.addedAt : fallbackAddedAt,
  };
}

export function normalizeLocation(location) {
  if (!location || typeof location !== 'object') return null;
  const name = toText(location.name, 60);
  if (!name) return null;
  return {
    id: toId(location.id) ?? uid(),
    name,
    kind: location.kind === 'digital' ? 'digital' : 'physical',
  };
}

/** Cleans one activity entry. Also accepts a v2 play (`gameId`, no type), which becomes a session. */
export function normalizeActivity(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const itemId = toId(entry.itemId) ?? toId(entry.gameId);
  if (!itemId) return null;
  return {
    id: toId(entry.id) ?? uid(),
    itemId,
    date: typeof entry.date === 'string' && entry.date ? entry.date : localDateTimeString(),
    type: ACTIVITY_TYPE_IDS.includes(entry.type) ? entry.type : 'session',
    players: toNames(entry.players),
    winners: toNames(entry.winners),
    note: toText(entry.note),
    rating: toRating(entry.rating),
  };
}

export function normalizeGuest(guest) {
  if (!guest || typeof guest !== 'object') return null;
  const name = toText(guest.name, 60);
  if (!name) return null;
  const status = GUEST_STATUSES.includes(guest.status)
    ? guest.status
    : LEGACY_STATUS[guest.status] ?? 'going';
  return { id: toId(guest.id) ?? uid(), name, status, note: toText(guest.note, 200) };
}

export function normalizeNight(night) {
  const source = night && typeof night === 'object' ? night : {};
  return {
    date: isLocalDateTime(source.date) ? source.date : defaultNightDate(),
    guests: Array.isArray(source.guests) ? source.guests.map(normalizeGuest).filter(Boolean) : [],
    houseRule: toText(source.houseRule),
    lockedItemId: toId(source.lockedItemId) ?? toId(source.lockedGameId),
  };
}

/** Wraps a record normalizer for a stored list: drops invalid records, rejects non-arrays (null). */
export const listOf = (normalize) => (stored) =>
  Array.isArray(stored) ? stored.map((record) => normalize(record)).filter(Boolean) : null;

// ---------- local dates ----------

const pad = (n) => String(n).padStart(2, '0');

/** `YYYY-MM-DDTHH:mm` in local time, the format `<input type="datetime-local">` uses. */
export function localDateTimeString(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function isLocalDateTime(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value);
}

/** Tonight at 19:00, or the next half hour if it is already past seven. */
export function defaultNightDate(now = new Date()) {
  const d = new Date(now);
  if (d.getHours() < 19) {
    d.setHours(19, 0, 0, 0);
  } else {
    d.setMinutes(d.getMinutes() < 30 ? 30 : 60, 0, 0);
  }
  return localDateTimeString(d);
}

// ---------- defaults ----------

export function defaultItems() {
  return seedItems.map((item) => normalizeItem(item)).filter(Boolean);
}

export function defaultLocations() {
  return seedLocations.map(normalizeLocation).filter(Boolean);
}

export function defaultNight() {
  return normalizeNight({ guests: [], houseRule: '' });
}

// ---------- migration ----------

/** v2 board game (or v1 game) to a v3 item on the living room shelf. */
export function itemFromGame(game, fallbackAddedAt) {
  return normalizeItem(
    { ...game, kind: 'board', format: 'box', locationId: game?.locationId ?? MIGRATED_LOCATION_ID },
    fallbackAddedAt,
  );
}

/** v1 RSVP blob to the night shape. */
const nightFromRsvp = (rsvp) =>
  normalizeNight({ date: rsvp.sessionDate, guests: rsvp.guests, houseRule: rsvp.houseRule });

/**
 * Copies older data into the v3 slices once: v2 games become board items, v2 plays become
 * session activity, and the v2 night carries over. Straight-from-v1 data (never opened in v2)
 * is read too. Old keys are kept, so nothing is lost if the user goes back to an older build.
 * A slice that already exists in v3 is never overwritten. Safe to call repeatedly.
 */
export function migrate() {
  if (typeof localStorage === 'undefined') return;
  const meta = read(KEYS.meta);
  if (meta && meta.version >= STORAGE_VERSION) return;

  const migratedAt = new Date().toISOString();

  if (read(KEYS.items) == null) {
    const games = read(LEGACY_KEYS.v2Games) ?? read(LEGACY_KEYS.v1Games);
    if (Array.isArray(games)) {
      write(KEYS.items, games.map((g) => itemFromGame(g, migratedAt)).filter(Boolean));
      // Migrated items point at a seed location, so make sure the seed list is stored with them.
      if (read(KEYS.locations) == null) write(KEYS.locations, defaultLocations());
    }
  }

  if (read(KEYS.activity) == null) {
    const plays = read(LEGACY_KEYS.v2Plays);
    if (Array.isArray(plays)) write(KEYS.activity, plays.map(normalizeActivity).filter(Boolean));
  }

  if (read(KEYS.night) == null) {
    const night = read(LEGACY_KEYS.v2Night);
    const rsvp = read(LEGACY_KEYS.v1Rsvp);
    if (night && typeof night === 'object') write(KEYS.night, normalizeNight(night));
    else if (rsvp && typeof rsvp === 'object') write(KEYS.night, nightFromRsvp(rsvp));
  }

  write(KEYS.meta, { version: STORAGE_VERSION, migratedAt });
}
