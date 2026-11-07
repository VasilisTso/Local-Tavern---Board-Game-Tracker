// Versioned localStorage access for Local Tavern.
// Each slice lives under its own key so hooks persist independently.
// Legacy data (`tavern_games`, `tavern_rsvp`) is migrated once and left in place.

import seedGames from '../data/games.json';

export const STORAGE_VERSION = 2;

export const KEYS = {
  meta: 'tavern:v2:meta',
  games: 'tavern:v2:games',
  plays: 'tavern:v2:plays',
  night: 'tavern:v2:night',
  theme: 'tavern:theme',
};

const LEGACY_KEYS = { games: 'tavern_games', rsvp: 'tavern_rsvp' };

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

export function normalizeGame(game, fallbackAddedAt = new Date().toISOString()) {
  if (!game || typeof game !== 'object') return null;
  const title = toText(game.title, 120);
  if (!title) return null;

  let minPlayers = toInt(game.minPlayers);
  let maxPlayers = toInt(game.maxPlayers);
  minPlayers = clamp(minPlayers ?? maxPlayers ?? 1, 1, 99);
  maxPlayers = clamp(maxPlayers ?? minPlayers, 1, 99);
  if (maxPlayers < minPlayers) [minPlayers, maxPlayers] = [maxPlayers, minPlayers];

  const playtime = toInt(game.playtime);
  const tags = Array.isArray(game.tags)
    ? [...new Set(game.tags.map((t) => toText(t, 40)).filter(Boolean))]
    : [];

  return {
    id: typeof game.id === 'string' && game.id ? game.id : uid(),
    title,
    minPlayers,
    maxPlayers,
    playtime: playtime == null ? null : clamp(playtime, 1, 1440),
    tags,
    addedAt: typeof game.addedAt === 'string' ? game.addedAt : fallbackAddedAt,
  };
}

export function normalizePlay(play) {
  if (!play || typeof play !== 'object' || typeof play.gameId !== 'string') return null;
  const names = (list) =>
    Array.isArray(list) ? [...new Set(list.map((n) => toText(n, 60)).filter(Boolean))] : [];
  const players = names(play.players);
  return {
    id: typeof play.id === 'string' && play.id ? play.id : uid(),
    gameId: play.gameId,
    date: typeof play.date === 'string' && play.date ? play.date : localDateTimeString(),
    players,
    winners: names(play.winners),
    note: toText(play.note),
  };
}

export function normalizeGuest(guest) {
  if (!guest || typeof guest !== 'object') return null;
  const name = toText(guest.name, 60);
  if (!name) return null;
  const status = GUEST_STATUSES.includes(guest.status)
    ? guest.status
    : LEGACY_STATUS[guest.status] ?? 'going';
  return { id: typeof guest.id === 'string' && guest.id ? guest.id : uid(), name, status, note: toText(guest.note, 200) };
}

export function normalizeNight(night) {
  const source = night && typeof night === 'object' ? night : {};
  return {
    date: isLocalDateTime(source.date) ? source.date : defaultNightDate(),
    guests: Array.isArray(source.guests) ? source.guests.map(normalizeGuest).filter(Boolean) : [],
    houseRule: toText(source.houseRule),
    lockedGameId: typeof source.lockedGameId === 'string' ? source.lockedGameId : null,
  };
}

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

export function defaultGames() {
  return seedGames.map((g) => normalizeGame(g)).filter(Boolean);
}

export function defaultNight() {
  return normalizeNight({ guests: [], houseRule: '' });
}

// ---------- migration ----------

/**
 * Copies legacy keys into the v2 slices once. Old keys are kept, so nothing is lost
 * if the user goes back to an older build. Safe to call repeatedly.
 */
export function migrate() {
  if (typeof localStorage === 'undefined') return;
  const meta = read(KEYS.meta);
  if (meta && meta.version >= STORAGE_VERSION) return;

  const migratedAt = new Date().toISOString();

  if (read(KEYS.games) == null) {
    const legacyGames = read(LEGACY_KEYS.games);
    if (Array.isArray(legacyGames)) {
      write(KEYS.games, legacyGames.map((g) => normalizeGame(g, migratedAt)).filter(Boolean));
    }
  }

  if (read(KEYS.night) == null) {
    const rsvp = read(LEGACY_KEYS.rsvp);
    if (rsvp && typeof rsvp === 'object') {
      write(
        KEYS.night,
        normalizeNight({ date: rsvp.sessionDate, guests: rsvp.guests, houseRule: rsvp.houseRule }),
      );
    }
  }

  write(KEYS.meta, { version: STORAGE_VERSION, migratedAt });
}
