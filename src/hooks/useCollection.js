import { useCallback, useEffect, useRef } from 'react';
import { usePersistentState } from './usePersistentState';

/** List helpers shared by persisted collections (games, plays) and nested lists (guests). */
export function insertAt(list, item, index) {
  if (list.some((x) => x.id === item.id)) return list;
  const next = [...list];
  next.splice(Math.min(Math.max(index, 0), next.length), 0, item);
  return next;
}

/**
 * A persisted list of `{ id }` records with add / update / remove / restore (undo).
 *
 * @param {string} key storage key
 * @param {() => object[]} getDefault initial list when nothing is stored
 * @param {(item: unknown) => object | null} normalizeItem validates one record
 * @param {(stored: unknown) => object[] | null} normalizeList validates the stored list
 */
export function useCollection(key, getDefault, normalizeItem, normalizeList) {
  const [items, setItems] = usePersistentState(key, getDefault, normalizeList);
  // Latest list for callbacks captured earlier (e.g. an Undo stored in a toast).
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  /** Adds a record and returns it (with its id), or null if invalid. */
  const add = useCallback(
    (input) => {
      const item = normalizeItem(input);
      if (!item) return null;
      setItems((prev) => [...prev, item]);
      return item;
    },
    [normalizeItem, setItems],
  );

  const update = useCallback(
    (id, patch) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? normalizeItem({ ...item, ...patch, id }) ?? item : item)),
      );
    },
    [normalizeItem, setItems],
  );

  /** Removes a record. Returns `{ item, index }` to pass to `restore`, or null. */
  const remove = useCallback(
    (id) => {
      const current = itemsRef.current;
      const index = current.findIndex((item) => item.id === id);
      if (index === -1) return null;
      setItems((prev) => prev.filter((item) => item.id !== id));
      return { item: current[index], index };
    },
    [setItems],
  );

  const restore = useCallback(
    (removed) => {
      if (removed?.item) setItems((prev) => insertAt(prev, removed.item, removed.index));
    },
    [setItems],
  );

  const replace = useCallback((list) => setItems(normalizeList(list) ?? []), [normalizeList, setItems]);

  return { items, add, update, remove, restore, replace };
}
