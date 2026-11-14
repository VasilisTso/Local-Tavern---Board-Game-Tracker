import { useCollection } from './useCollection';
import { KEYS, listOf, normalizeActivity } from '../lib/storage';

const noActivity = () => [];
const normalizeList = listOf(normalizeActivity);

/** Activity log: `{ id, itemId, date, type, players[], winners[], note, rating }`. */
export function useActivity() {
  const { items, add, update, remove, restore, replace } = useCollection(
    KEYS.activity,
    noActivity,
    normalizeActivity,
    normalizeList,
  );

  return {
    activity: items,
    /** Returns the new entry, or null if the input is invalid. */
    addActivity: (input) => add({ ...input, id: undefined }),
    updateActivity: update,
    /** Returns `{ item, index }` for `restoreActivity`. */
    removeActivity: remove,
    restoreActivity: restore,
    replaceActivity: replace,
  };
}
