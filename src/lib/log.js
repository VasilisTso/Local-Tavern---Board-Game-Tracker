// Activity log helpers: grouping, names and stats. Pure; entry dates are local `YYYY-MM-DDTHH:mm`.

import { KINDS, lengthUnit } from './kinds';

const byDateDesc = (a, b) => (a.date === b.date ? 0 : a.date < b.date ? 1 : -1);

/** Entries newest first, grouped by calendar month: `[{ key: 'YYYY-MM', label, entries }]`. */
export function groupByMonth(activity, now = new Date()) {
  const groups = [];
  for (const entry of [...activity].sort(byDateDesc)) {
    const key = entry.date.slice(0, 7);
    let group = groups.at(-1);
    if (!group || group.key !== key) {
      const [y, m] = key.split('-').map(Number);
      const opts = { month: 'long' };
      if (y !== now.getFullYear()) opts.year = 'numeric';
      const label = Number.isFinite(y) && Number.isFinite(m)
        ? new Date(y, m - 1, 1).toLocaleDateString(undefined, opts)
        : 'Undated';
      group = { key, label, entries: [] };
      groups.push(group);
    }
    group.entries.push(entry);
  }
  return groups;
}

const fold = (name) => name.trim().toLowerCase();

/**
 * Names to offer in the log dialog: tonight's going guests, then maybes, then the rest of
 * the guest list, then everyone from past plays (most frequent first). Deduped, case-insensitive.
 */
export function knownPlayerNames(night, plays) {
  const seen = new Set();
  const out = [];
  const push = (name) => {
    const key = fold(name);
    if (!key || seen.has(key)) return;
    seen.add(key);
    out.push(name.trim());
  };
  const guests = night?.guests ?? [];
  for (const status of ['going', 'maybe', 'not-going']) {
    guests.filter((g) => g.status === status).forEach((g) => push(g.name));
  }
  const counts = new Map();
  for (const play of plays) {
    for (const name of play.players) {
      const key = fold(name);
      const entry = counts.get(key) ?? { name, count: 0 };
      entry.count += 1;
      counts.set(key, entry);
    }
  }
  [...counts.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)).forEach((e) => push(e.name));
  return out;
}

const DAY = 24 * 60 * 60 * 1000;

/** Whole days between a local date string and now (never negative). */
export function daysSince(date, now = Date.now()) {
  const t = new Date(date).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.floor((now - t) / DAY));
}

/** "today", "3 days ago", "5 weeks ago", "8 months ago", "2 years ago". */
export function agoLabel(days) {
  if (days == null) return '';
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.round(days / 7)} weeks ago`;
  if (days < 730) return `${Math.round(days / 30.4)} months ago`;
  return `${Math.round(days / 365)} years ago`;
}

/** True when the item counts in reading stats as pages (print and ebook). */
const countsPages = (item) => item.kind === 'book' && lengthUnit(item.kind, item.format) === 'pages';

/** Items still waiting their turn: owned and not finished, dropped or only wished for. */
const OPEN_STATUSES = new Set(['backlog', 'active']);

const byLatest = (a, b) => (b.last ?? '').localeCompare(a.last ?? '');

/**
 * Everything the Log stats show, for the kinds in scope (empty `kinds` means every kind).
 * Headline figures cover the calendar year of `now`; the rest covers the whole log.
 * Time figures are estimates from each item's listed length: a board game's playtime per
 * session, and a whole item's length once when it is finished.
 * @returns {{
 *   year: number, entries: number, kinds: string[],
 *   figures: { id: string, label: string, value: number, unit?: string, detail?: string }[],
 *   byKind: { kind: object, count: number }[],
 *   mostUsed: { item: object, count: number, last: string }[],
 *   winners: { name: string, wins: number, played: number }[] | null,
 *   dusty: { item: object, last: string | null, days: number | null }[],
 * }}
 */
export function logStats(activity, items, { kinds = [], top = 5, now = Date.now() } = {}) {
  const scope = kinds.length ? KINDS.filter((k) => kinds.includes(k.id)).map((k) => k.id) : KINDS.map((k) => k.id);
  const inScope = (item) => scope.includes(item.kind);
  const itemById = new Map(items.map((i) => [i.id, i]));
  const scopedItems = items.filter(inScope);
  // Entries for removed items only count when every kind is in view.
  const entries = activity.filter((a) => {
    const item = itemById.get(a.itemId);
    return item ? inScope(item) : kinds.length === 0;
  });

  const year = new Date(now).getFullYear();
  const thisYear = entries.filter((a) => a.date.startsWith(`${year}-`));
  const has = (kind) => scope.includes(kind);

  let finished = 0;
  let pages = 0;
  let playMinutes = 0;
  let watchMinutes = 0;
  const nights = new Set();
  for (const entry of thisYear) {
    const item = itemById.get(entry.itemId);
    if (entry.type === 'finished') finished += 1;
    if (item?.kind === 'board' && entry.type === 'session') {
      nights.add(entry.date.slice(0, 10));
      playMinutes += item.length ?? 0;
    } else if (item && entry.type === 'finished') {
      if (countsPages(item)) pages += item.length ?? 0;
      else if (item.kind === 'video') playMinutes += item.length ?? 0;
      else watchMinutes += item.length ?? 0;
    }
  }
  const hours = (minutes) => Math.round(minutes / 60);

  const figures = [{ id: 'finished', label: 'Finished', value: finished, detail: `in ${year}` }];
  if (has('board')) figures.push({ id: 'nights', label: 'Game nights', value: nights.size, detail: `in ${year}` });
  if (has('book')) figures.push({ id: 'pages', label: 'Pages read', value: pages, detail: 'from finished books' });
  if (has('board') || has('video')) figures.push({ id: 'played', label: 'Hours played', value: hours(playMinutes), detail: 'by listed length' });
  if (has('film') || has('music') || has('book')) {
    const label = has('film') ? (has('music') ? 'Hours watched and heard' : 'Hours watched') : 'Hours listened';
    figures.push({ id: 'watched', label, value: hours(watchMinutes), detail: 'by listed length' });
  }
  // Board-only scope: finishing does not apply, so lead with nights.
  if (scope.length === 1 && scope[0] === 'board') figures.shift();

  const byKind = KINDS.filter((k) => has(k.id))
    .map((kind) => ({ kind, count: thisYear.filter((a) => itemById.get(a.itemId)?.kind === kind.id).length }))
    .filter((k) => k.count > 0)
    .sort((a, b) => b.count - a.count);

  // Most used: sessions and finishes per item still in the library.
  const uses = new Map();
  const lastUse = new Map();
  for (const entry of entries) {
    if (!itemById.has(entry.itemId)) continue;
    if (!lastUse.get(entry.itemId) || entry.date > lastUse.get(entry.itemId)) lastUse.set(entry.itemId, entry.date);
    if (entry.type === 'started') continue;
    uses.set(entry.itemId, (uses.get(entry.itemId) ?? 0) + 1);
  }
  const mostUsed = [...uses.entries()]
    .map(([id, count]) => ({ item: itemById.get(id), count, last: lastUse.get(id) }))
    .sort((a, b) => b.count - a.count || byLatest(a, b) || a.item.title.localeCompare(b.item.title))
    .slice(0, top);

  // Win leaderboard, board games only: names matched case-insensitively, shown as first written.
  let winners = null;
  if (has('board')) {
    const people = new Map();
    const person = (name) => {
      const key = fold(name);
      if (!people.has(key)) people.set(key, { name: name.trim(), wins: 0, played: 0 });
      return people.get(key);
    };
    for (const entry of entries) {
      const item = itemById.get(entry.itemId);
      if (entry.type !== 'session' || (item && item.kind !== 'board')) continue;
      const won = new Set(entry.winners.map(fold));
      for (const name of entry.players) {
        const p = person(name);
        p.played += 1;
        if (won.has(fold(name))) p.wins += 1;
      }
      // A winner not listed as a player still counts as having played.
      for (const name of entry.winners) {
        if (!entry.players.some((n) => fold(n) === fold(name))) {
          const p = person(name);
          p.played += 1;
          p.wins += 1;
        }
      }
    }
    winners = [...people.values()]
      .filter((p) => p.wins > 0)
      .sort((a, b) => b.wins - a.wins || a.played - b.played || a.name.localeCompare(b.name))
      .slice(0, top);
  }

  // Gathering dust: open items never touched first (oldest added first), then the longest since last use.
  const dusty = scopedItems
    .filter((item) => OPEN_STATUSES.has(item.status))
    .map((item) => ({ item, last: lastUse.get(item.id) ?? null }))
    .sort((a, b) => {
      if (!a.last && !b.last) return (a.item.addedAt ?? '').localeCompare(b.item.addedAt ?? '') || a.item.title.localeCompare(b.item.title);
      if (!a.last) return -1;
      if (!b.last) return 1;
      return a.last.localeCompare(b.last);
    })
    .slice(0, top)
    .map((entry) => ({ ...entry, days: entry.last ? daysSince(entry.last, now) : null }));

  return { year, entries: entries.length, kinds: scope, figures, byKind, mostUsed, winners, dusty };
}

/** Entries whose item is one of `kinds` (all entries when `kinds` is empty; removed items only then). */
export function filterActivityByKind(activity, items, kinds) {
  if (!kinds.length) return activity;
  const kindOf = new Map(items.map((i) => [i.id, i.kind]));
  return activity.filter((a) => kinds.includes(kindOf.get(a.itemId)));
}
