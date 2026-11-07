import { useCollection } from './useCollection';
import { KEYS, normalizePlay } from '../lib/storage';

const noPlays = () => [];
const normalizeList = (stored) =>
  Array.isArray(stored) ? stored.map(normalizePlay).filter(Boolean) : null;

/** Play log: `{ id, gameId, date, players[], winners[], note }`. */
export function usePlays() {
  const { items, add, update, remove, restore, replace } = useCollection(
    KEYS.plays,
    noPlays,
    normalizePlay,
    normalizeList,
  );

  return {
    plays: items,
    /** Returns the new play, or null if the input is invalid. */
    addPlay: (input) => add({ ...input, id: undefined }),
    updatePlay: update,
    /** Returns `{ item, index }` for `restorePlay`. */
    removePlay: remove,
    restorePlay: restore,
    replacePlays: replace,
  };
}
