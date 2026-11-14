import { useCallback, useEffect, useState } from 'react';

function fromHash(ids, aliases, fallback) {
  const hash = window.location.hash.replace(/^#/, '');
  const id = aliases[hash] ?? hash;
  return ids.includes(id) ? id : fallback;
}

const NO_ALIASES = {};

/**
 * Active tab synced to the URL hash (#library, #pick, #log). `aliases` maps old hashes to tab ids.
 * Switching tabs pushes a history entry, so Back returns to the previous tab.
 */
export function useHashTab(ids, aliases = NO_ALIASES, fallback = ids[0]) {
  const [active, setActive] = useState(() => fromHash(ids, aliases, fallback));

  useEffect(() => {
    const onHashChange = () => setActive(fromHash(ids, aliases, fallback));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [ids, aliases, fallback]);

  const select = useCallback(
    (id) => {
      if (!ids.includes(id)) return;
      setActive(id);
      if (window.location.hash !== `#${id}`) {
        window.history.pushState(null, '', `#${id}`);
      }
    },
    [ids],
  );

  return [active, select];
}
