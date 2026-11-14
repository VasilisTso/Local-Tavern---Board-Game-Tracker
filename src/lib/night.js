// Derived facts about tonight, shared by the Shelf filter and the Tonight tab.

/** Guests by status. */
export function guestCounts(guests = []) {
  const counts = { going: 0, maybe: 0, 'not-going': 0 };
  for (const g of guests) counts[g.status] = (counts[g.status] ?? 0) + 1;
  return counts;
}

/** Players at the table tonight: the host plus everyone going (optionally the maybes). */
export function tonightPlayerCount(night, { includeMaybe = false } = {}) {
  const counts = guestCounts(night?.guests);
  return 1 + counts.going + (includeMaybe ? counts.maybe : 0);
}

/** False for items without a player range (books, films, music, unspecified video games). */
export function fitsPlayers(item, n) {
  if (item.minPlayers == null || item.maxPlayers == null) return false;
  return n >= item.minPlayers && n <= item.maxPlayers;
}

/** "4 at the table · 1 maybe · 2 out" (host included in the table count). */
export function nightCountsLine(night) {
  const counts = guestCounts(night?.guests);
  const parts = [`${1 + counts.going} at the table`];
  if (counts.maybe) parts.push(`${counts.maybe} maybe`);
  if (counts['not-going']) parts.push(`${counts['not-going']} out`);
  return parts.join(' · ');
}
