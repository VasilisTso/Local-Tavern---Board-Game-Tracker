import { useCollection } from './useCollection';
import { KEYS, defaultGames, normalizeGame } from '../lib/storage';

// New games get a fresh id and addedAt; edits keep theirs (update passes the id through).
const normalizeItem = (input) =>
  normalizeGame({ ...input, id: input?.id, addedAt: input?.addedAt ?? new Date().toISOString() });

const normalizeList = (stored) =>
  Array.isArray(stored) ? stored.map((g) => normalizeGame(g)).filter(Boolean) : null;

export function useGames() {
  const { items, add, update, remove, restore, replace } = useCollection(
    KEYS.games,
    defaultGames,
    normalizeItem,
    normalizeList,
  );

  return {
    games: items,
    /** Returns the new game, or null if the input is invalid. */
    addGame: (input) => add({ ...input, id: undefined, addedAt: undefined }),
    updateGame: update,
    /** Returns `{ item, index }` for `restoreGame`. */
    removeGame: remove,
    restoreGame: restore,
    replaceGames: replace,
  };
}
