import { useCollection } from './useCollection';
import { KEYS, listOf, defaultLocations, normalizeLocation } from '../lib/storage';

const normalizeList = listOf(normalizeLocation);

/** Places items live: `{ id, name, kind: 'physical' | 'digital' }`. */
export function useLocations() {
  const { items, add, update, remove, restore, replace } = useCollection(
    KEYS.locations,
    defaultLocations,
    normalizeLocation,
    normalizeList,
  );

  return {
    locations: items,
    /** Returns the new location, or null for an empty name. */
    addLocation: (input) => add({ ...input, id: undefined }),
    updateLocation: update,
    /** Returns `{ item, index }` for `restoreLocation`. Items keep their `locationId`. */
    removeLocation: remove,
    restoreLocation: restore,
    replaceLocations: replace,
  };
}
