// Per-item history derived from the activity log.

/** Map of itemId -> { count, last } where `last` is the latest activity date string. */
export function playStatsByGame(activity = []) {
  const stats = new Map();
  for (const { itemId, date } of activity) {
    const entry = stats.get(itemId) ?? { count: 0, last: null };
    entry.count += 1;
    if (!entry.last || date > entry.last) entry.last = date;
    stats.set(itemId, entry);
  }
  return stats;
}
