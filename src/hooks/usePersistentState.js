import { useEffect, useState } from 'react';
import { read, write } from '../lib/storage';

const identity = (value) => value;

function load(key, getDefault, normalize) {
  const stored = read(key);
  const value = stored == null ? null : normalize(stored);
  return value ?? getDefault();
}

/**
 * useState backed by localStorage. Reads synchronously on first render (no empty flash),
 * writes on every change, and follows edits made in other tabs.
 * Pass module-level functions for `getDefault` / `normalize` so they stay stable.
 *
 * @param {string} key storage key
 * @param {() => T} getDefault called when nothing valid is stored
 * @param {(stored: unknown) => T | null} [normalize] cleans stored data; return null to reject it
 */
export function usePersistentState(key, getDefault, normalize = identity) {
  const [state, setState] = useState(() => load(key, getDefault, normalize));

  useEffect(() => {
    write(key, state);
  }, [key, state]);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === key && event.storageArea === localStorage) {
        setState(load(key, getDefault, normalize));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key, getDefault, normalize]);

  return [state, setState];
}
