// Backup file (export / import) and the plain-text night summary.

import {
  STORAGE_VERSION,
  MIGRATED_LOCATION_ID,
  defaultLocations,
  itemFromGame,
  localDateTimeString,
  normalizeActivity,
  normalizeItem,
  normalizeLocation,
  normalizeNight,
} from './storage';
import { formatNightDate, formatPlaytime } from './format';
import { lengthUnit } from './kinds';

// Kept from the Local Tavern days so every backup ever exported still imports.
export const BACKUP_APP = 'local-tavern';

/**
 * `{ app, version, exportedAt, items, locations, activity, night, covers? }`.
 * `covers` (`{ [coverId]: dataUrl }`) is only present when images were included.
 */
export function buildBackup({ items, locations, activity, night, covers = null }) {
  const backup = { app: BACKUP_APP, version: STORAGE_VERSION, exportedAt: new Date().toISOString(), items, locations, activity, night };
  if (covers && Object.keys(covers).length) backup.covers = covers;
  return backup;
}

export function backupFileName(now = new Date()) {
  return `shelfspace-backup-${localDateTimeString(now).slice(0, 10)}.json`;
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

const NOT_A_BACKUP = 'That file is not a Shelfspace backup.';

/** Only string ids mapped to string values; the cover store checks each data URL again on import. */
function cleanCovers(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return Object.fromEntries(
    Object.entries(raw).filter(([id, url]) => id && typeof url === 'string' && url.startsWith('data:image/')),
  );
}

/**
 * Checks and cleans an imported backup. Reads v3 files and v1/v2 ones (`games`, `plays`),
 * whose games become board items and plays become sessions.
 * @returns {{ ok: true, data: { items, locations, activity, night, covers, exportedAt, version, skipped } }
 *   | { ok: false, error: string }}
 * v1/v2 files had no places; they get the seed place their items are shelved in, so a merge
 * adds it back when it is missing. `legacy` is true for them.
 */
export function parseBackup(text) {
  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'That file is not valid JSON.' };
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ok: false, error: NOT_A_BACKUP };
  if (raw.app !== undefined && raw.app !== BACKUP_APP) {
    return { ok: false, error: 'That file is from a different app.' };
  }
  if (typeof raw.version !== 'number') return { ok: false, error: NOT_A_BACKUP };
  if (raw.version > STORAGE_VERSION) {
    return { ok: false, error: 'That backup comes from a newer version of Shelfspace.' };
  }

  const legacy = raw.version < 3;
  const rawItems = legacy ? raw.games : raw.items;
  const rawActivity = (legacy ? raw.plays : raw.activity) ?? [];
  if (!Array.isArray(rawItems)) return { ok: false, error: NOT_A_BACKUP };
  if (!Array.isArray(rawActivity)) return { ok: false, error: 'The activity log in that file is damaged.' };
  if (!legacy && raw.locations !== undefined && !Array.isArray(raw.locations)) {
    return { ok: false, error: 'The list of places in that file is damaged.' };
  }

  const items = rawItems.map((item) => (legacy ? itemFromGame(item) : normalizeItem(item))).filter(Boolean);
  const activity = rawActivity.map(normalizeActivity).filter(Boolean);
  const rawLocations = legacy ? null : raw.locations ?? null;
  const locations = legacy
    ? defaultLocations().filter((l) => l.id === MIGRATED_LOCATION_ID)
    : rawLocations
      ? rawLocations.map(normalizeLocation).filter(Boolean)
      : null;
  const skipped =
    rawItems.length - items.length +
    rawActivity.length - activity.length +
    (rawLocations ? rawLocations.length - locations.length : 0);
  const night = raw.night && typeof raw.night === 'object' ? normalizeNight(raw.night) : null;

  return {
    ok: true,
    data: {
      items,
      locations,
      activity,
      night,
      covers: legacy ? {} : cleanCovers(raw.covers),
      exportedAt: typeof raw.exportedAt === 'string' ? raw.exportedAt : null,
      version: raw.version,
      legacy,
      skipped,
    },
  };
}

const fold = (text) => text.trim().toLowerCase();

/**
 * Adds what the backup has that the current data lacks.
 * - Places match by id, then by name.
 * - Items match by id, then by title within the same kind (a book and a film may share a title).
 *   A matched item stays as it is, except that it takes the backup's cover when it has none.
 *   New items follow their place to the kept place id.
 * - Activity follows its item to the kept id, and matches by id or by item + date + type.
 * The night stays as it is.
 * @returns {{ items, locations, activity, added: { items: number, locations: number, activity: number } }}
 */
export function mergeBackup(current, incoming) {
  const locations = [...current.locations];
  const locationIdMap = new Map();
  let addedLocations = 0;
  {
    const byId = new Map(locations.map((l) => [l.id, l]));
    const byName = new Map(locations.map((l) => [fold(l.name), l]));
    for (const location of incoming.locations ?? []) {
      const match = byId.get(location.id) ?? byName.get(fold(location.name));
      if (match) {
        locationIdMap.set(location.id, match.id);
        continue;
      }
      locations.push(location);
      byId.set(location.id, location);
      byName.set(fold(location.name), location);
      locationIdMap.set(location.id, location.id);
      addedLocations += 1;
    }
  }

  const items = [...current.items];
  const itemIdMap = new Map();
  let addedItems = 0;
  {
    const titleKey = (item) => `${item.kind}|${fold(item.title)}`;
    const byId = new Map(items.map((i) => [i.id, i]));
    const byTitle = new Map(items.map((i) => [titleKey(i), i]));
    for (const incomingItem of incoming.items) {
      const match = byId.get(incomingItem.id) ?? byTitle.get(titleKey(incomingItem));
      if (match) {
        itemIdMap.set(incomingItem.id, match.id);
        // Keep the existing item, but take the backup's cover when this copy has none.
        if (!match.coverId && !match.coverUrl && (incomingItem.coverId || incomingItem.coverUrl)) {
          const withCover = { ...match, coverId: incomingItem.coverId, coverUrl: incomingItem.coverUrl };
          items[items.indexOf(match)] = withCover;
          byId.set(withCover.id, withCover);
          byTitle.set(titleKey(withCover), withCover);
        }
        continue;
      }
      const { locationId } = incomingItem;
      const item = { ...incomingItem, locationId: locationId ? locationIdMap.get(locationId) ?? locationId : null };
      items.push(item);
      byId.set(item.id, item);
      byTitle.set(titleKey(item), item);
      itemIdMap.set(item.id, item.id);
      addedItems += 1;
    }
  }

  const activity = [...current.activity];
  let addedActivity = 0;
  {
    const entryKey = (e) => `${e.itemId}|${e.date}|${e.type}`;
    const ids = new Set(activity.map((e) => e.id));
    const keys = new Set(activity.map(entryKey));
    for (const incomingEntry of incoming.activity) {
      const entry = { ...incomingEntry, itemId: itemIdMap.get(incomingEntry.itemId) ?? incomingEntry.itemId };
      if (ids.has(entry.id) || keys.has(entryKey(entry))) continue;
      activity.push(entry);
      ids.add(entry.id);
      keys.add(entryKey(entry));
      addedActivity += 1;
    }
  }

  return {
    items,
    locations,
    activity,
    added: { items: addedItems, locations: addedLocations, activity: addedActivity },
  };
}

/** Plain text for a group chat: date, pick, who is coming, house rule. */
export function nightSummary(night, items) {
  const pick = items.find((item) => item.id === night.lockedItemId);
  const names = (status) => night.guests.filter((g) => g.status === status).map((g) => (g.note ? `${g.name} (${g.note})` : g.name));
  const going = names('going');
  const maybe = names('maybe');
  const out = names('not-going');

  const lines = [`Game night: ${formatNightDate(night.date)}`];
  if (pick) {
    const time = pick.length && lengthUnit(pick.kind, pick.format) === 'min' ? `, about ${formatPlaytime(pick.length)}` : '';
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
