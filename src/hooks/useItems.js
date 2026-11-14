import { useCollection } from './useCollection';
import { KEYS, listOf, defaultItems, normalizeItem as normalizeStoredItem } from '../lib/storage';

// New items get a fresh id and addedAt; edits keep theirs (update passes the id through).
const normalizeItem = (input) =>
  normalizeStoredItem({ ...input, id: input?.id, addedAt: input?.addedAt ?? new Date().toISOString() });

const normalizeList = listOf(normalizeStoredItem);

/** Library items (books, games, films, records). See `normalizeItem` in lib/storage for the shape. */
export function useItems() {
  const { items, add, update, remove, restore, replace } = useCollection(
    KEYS.items,
    defaultItems,
    normalizeItem,
    normalizeList,
  );

  return {
    items,
    /** Returns the new item, or null if the input is invalid. */
    addItem: (input) => add({ ...input, id: undefined, addedAt: undefined }),
    updateItem: update,
    /** Returns `{ item, index }` for `restoreItem`. */
    removeItem: remove,
    restoreItem: restore,
    replaceItems: replace,
  };
}
