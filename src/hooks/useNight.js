import { useCallback } from 'react';
import { usePersistentState } from './usePersistentState';
import { insertAt } from './useCollection';
import { KEYS, defaultNight, normalizeGuest, normalizeNight } from '../lib/storage';

/** Game night: `{ date, guests[{ id, name, status, note }], houseRule, lockedItemId }`. */
export function useNight() {
  const [night, setNight] = usePersistentState(KEYS.night, defaultNight, normalizeNight);

  const patch = useCallback((changes) => setNight((prev) => ({ ...prev, ...changes })), [setNight]);

  const setDate = useCallback((date) => patch({ date }), [patch]);
  const setHouseRule = useCallback((houseRule) => patch({ houseRule }), [patch]);
  /** Lock an item in for the night, or pass null to clear the pick. */
  const lockItem = useCallback((lockedItemId) => patch({ lockedItemId }), [patch]);

  /** Adds a guest (default status "going") and returns it, or null for an empty name. */
  const addGuest = useCallback(
    (name, status = 'going') => {
      const guest = normalizeGuest({ name, status });
      if (guest) setNight((prev) => ({ ...prev, guests: [...prev.guests, guest] }));
      return guest;
    },
    [setNight],
  );

  const updateGuest = useCallback(
    (id, changes) => {
      setNight((prev) => ({
        ...prev,
        guests: prev.guests.map((g) => (g.id === id ? normalizeGuest({ ...g, ...changes, id }) ?? g : g)),
      }));
    },
    [setNight],
  );

  /** Removes a guest. Returns `{ item, index }` for `restoreGuest`, or null. */
  const removeGuest = useCallback(
    (id) => {
      const index = night.guests.findIndex((g) => g.id === id);
      if (index === -1) return null;
      setNight((prev) => ({ ...prev, guests: prev.guests.filter((g) => g.id !== id) }));
      return { item: night.guests[index], index };
    },
    [night.guests, setNight],
  );

  const restoreGuest = useCallback(
    (removed) => {
      if (removed?.item) {
        setNight((prev) => ({ ...prev, guests: insertAt(prev.guests, removed.item, removed.index) }));
      }
    },
    [setNight],
  );

  const replaceNight = useCallback((value) => setNight(normalizeNight(value)), [setNight]);

  return {
    night,
    setDate,
    setHouseRule,
    lockItem,
    addGuest,
    updateGuest,
    removeGuest,
    restoreGuest,
    replaceNight,
  };
}
