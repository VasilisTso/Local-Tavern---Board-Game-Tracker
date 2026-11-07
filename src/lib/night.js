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

export function fitsPlayers(game, n) {
  return n >= game.minPlayers && n <= game.maxPlayers;
}
