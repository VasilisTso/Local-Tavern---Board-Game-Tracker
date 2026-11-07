// Backup file (export / import) and the plain-text night summary.

import { STORAGE_VERSION, localDateTimeString, normalizeGame, normalizeNight, normalizePlay } from './storage';
import { formatNightDate } from './format';

export const BACKUP_APP = 'local-tavern';

/** `{ app, version, exportedAt, games, plays, night }` */
export function buildBackup({ games, plays, night }) {
  return { app: BACKUP_APP, version: STORAGE_VERSION, exportedAt: new Date().toISOString(), games, plays, night };
}

export function backupFileName(now = new Date()) {
  return `local-tavern-backup-${localDateTimeString(now).slice(0, 10)}.json`;
}

/** Saves `data` as a JSON file through a temporary download link. */
export function downloadJson(data, fileName) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/**
 * Checks and cleans an imported backup.
 * @returns {{ ok: true, data: { games, plays, night, exportedAt, skipped } } | { ok: false, error: string }}
 */
export function parseBackup(text) {
  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'That file is not valid JSON.' };
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, error: 'That file is not a Local Tavern backup.' };
  }
  if (raw.app !== undefined && raw.app !== BACKUP_APP) {
    return { ok: false, error: 'That file is from a different app.' };
  }
  if (typeof raw.version !== 'number' || !Array.isArray(raw.games)) {
    return { ok: false, error: 'That file is not a Local Tavern backup.' };
  }
  if (raw.version > STORAGE_VERSION) {
    return { ok: false, error: 'That backup comes from a newer version of Local Tavern.' };
  }
  if (raw.plays !== undefined && !Array.isArray(raw.plays)) {
    return { ok: false, error: 'The play log in that file is damaged.' };
  }

  const games = raw.games.map((g) => normalizeGame(g)).filter(Boolean);
  const plays = (raw.plays ?? []).map(normalizePlay).filter(Boolean);
  const skipped = raw.games.length - games.length + (raw.plays?.length ?? 0) - plays.length;
  const night = raw.night && typeof raw.night === 'object' ? normalizeNight(raw.night) : null;

  return {
    ok: true,
    data: {
      games,
      plays,
      night,
      exportedAt: typeof raw.exportedAt === 'string' ? raw.exportedAt : null,
      skipped,
    },
  };
}

const fold = (text) => text.trim().toLowerCase();

/**
 * Adds what the backup has that the current data lacks. Games match by id, then by title,
 * and plays follow their game to the kept id. Plays match by id, or by game + date.
 * Tonight's night stays as it is.
 * @returns {{ games, plays, added: { games: number, plays: number } }}
 */
export function mergeBackup(current, incoming) {
  const games = [...current.games];
  const byId = new Map(games.map((g) => [g.id, g]));
  const byTitle = new Map(games.map((g) => [fold(g.title), g]));
  const gameIdMap = new Map();
  let addedGames = 0;

  for (const game of incoming.games) {
    const match = byId.get(game.id) ?? byTitle.get(fold(game.title));
    if (match) {
      gameIdMap.set(game.id, match.id);
      continue;
    }
    games.push(game);
    byId.set(game.id, game);
    byTitle.set(fold(game.title), game);
    gameIdMap.set(game.id, game.id);
    addedGames += 1;
  }

  const plays = [...current.plays];
  const playIds = new Set(plays.map((p) => p.id));
  const playKeys = new Set(plays.map((p) => `${p.gameId}|${p.date}`));
  let addedPlays = 0;

  for (const play of incoming.plays) {
    const gameId = gameIdMap.get(play.gameId) ?? play.gameId;
    const key = `${gameId}|${play.date}`;
    if (playIds.has(play.id) || playKeys.has(key)) continue;
    plays.push({ ...play, gameId });
    playIds.add(play.id);
    playKeys.add(key);
    addedPlays += 1;
  }

  return { games, plays, added: { games: addedGames, plays: addedPlays } };
}

/** Plain text for a group chat: date, pick, who is coming, house rule. */
export function nightSummary(night, games) {
  const pick = games.find((g) => g.id === night.lockedGameId);
  const names = (status) => night.guests.filter((g) => g.status === status).map((g) => (g.note ? `${g.name} (${g.note})` : g.name));
  const going = names('going');
  const maybe = names('maybe');
  const out = names('not-going');

  const lines = [`Game night: ${formatNightDate(night.date)}`];
  if (pick) {
    const time = pick.playtime ? `, about ${pick.playtime} min` : '';
    lines.push(`Playing: ${pick.title}${time}`);
  }
  lines.push(going.length ? `Coming (${going.length} + host): ${going.join(', ')}` : 'Coming: just the host so far');
  if (maybe.length) lines.push(`Maybe: ${maybe.join(', ')}`);
  if (out.length) lines.push(`Can't make it: ${out.join(', ')}`);
  if (night.houseRule) lines.push(`House rule: ${night.houseRule}`);
  return lines.join('\n');
}

/** Clipboard write with a fallback for plain-http LAN use, where `navigator.clipboard` is missing. */
export async function copyText(text) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to the legacy path
    }
  }
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.append(area);
  area.select();
  let ok;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
}
