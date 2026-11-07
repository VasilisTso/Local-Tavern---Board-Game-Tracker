// Display helpers. All dates are local time.

export function formatPlayers(min, max) {
  if (min === max) return `${min} ${min === 1 ? 'player' : 'players'}`;
  return `${min}–${max} players`;
}

export function formatPlaytime(minutes) {
  if (minutes == null) return null;
  if (minutes < 120) return `${minutes} min`;
  const hours = Math.round((minutes / 60) * 2) / 2;
  return `${hours} h`;
}

/** Parses `YYYY-MM-DDTHH:mm` (or an ISO string) as a local Date. */
export function parseLocal(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "12 Oct", or "12 Oct 2025" when not this year. */
export function formatShortDate(value, now = new Date()) {
  const d = value instanceof Date ? value : parseLocal(value);
  if (!d) return '';
  const opts = { day: 'numeric', month: 'short' };
  if (d.getFullYear() !== now.getFullYear()) opts.year = 'numeric';
  return d.toLocaleDateString(undefined, opts);
}
