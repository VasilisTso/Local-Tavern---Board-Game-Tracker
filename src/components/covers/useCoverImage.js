import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { COVERS_CHANGED, getCover } from '../../lib/coverStore';

// Object URLs for stored cover blobs, shared by every Cover on the page so a cover that
// remounts (the shelf-to-sheet transition) shows its image at once instead of flashing.
const resolved = new Map(); // coverId -> object URL, or null when nothing is stored
const pending = new Set();
const listeners = new Map(); // coverId -> Set of listeners, so a resolved blob wakes only its covers
let generation = 0;

const emit = (id) => (id ? listeners.get(id) : [...listeners.values()].flatMap((set) => [...set]))?.forEach((listener) => listener());

function subscribe(id, listener) {
  if (!listeners.has(id)) listeners.set(id, new Set());
  listeners.get(id).add(listener);
  return () => {
    listeners.get(id)?.delete(listener);
    if (!listeners.get(id)?.size) listeners.delete(id);
  };
}

function request(id) {
  if (resolved.has(id) || pending.has(id)) return;
  pending.add(id);
  const asked = generation;
  getCover(id)
    .then((blob) => {
      if (asked === generation) resolved.set(id, blob ? URL.createObjectURL(blob) : null);
    })
    .finally(() => {
      pending.delete(id);
      emit(id);
    });
}

// A backup import can overwrite blobs under the same ids: forget every URL and reload.
if (typeof window !== 'undefined') {
  window.addEventListener(COVERS_CHANGED, () => {
    generation += 1;
    for (const url of resolved.values()) if (url) URL.revokeObjectURL(url);
    resolved.clear();
    pending.clear();
    emit();
  });
}

/**
 * The image a cover should show: the uploaded blob first, then the image URL.
 * Returns `{ src, onError }`; `src` is null when there is no image or every candidate failed
 * to load, and the generated cover shows instead.
 */
export function useCoverImage(coverId, coverUrl) {
  const subscribeToCover = useCallback((listener) => (coverId ? subscribe(coverId, listener) : () => {}), [coverId]);
  const stored = useSyncExternalStore(subscribeToCover, () => (coverId ? resolved.get(coverId) : null));

  useEffect(() => {
    if (coverId && stored === undefined) request(coverId);
  }, [coverId, stored]);

  const [failed, setFailed] = useState(() => new Set());
  const src = [stored, coverUrl].find((candidate) => candidate && !failed.has(candidate)) ?? null;
  const onError = () => {
    if (src) setFailed((prev) => new Set(prev).add(src));
  };
  return { src, onError };
}
