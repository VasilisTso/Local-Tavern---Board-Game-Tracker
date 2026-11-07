import { useCallback, useEffect, useState } from 'react';

function fromHash(ids, fallback) {
  const id = window.location.hash.replace(/^#/, '');
  return ids.includes(id) ? id : fallback;
}

/**
 * Active tab synced to the URL hash (#tonight, #shelf, #ledger).
 * Switching tabs pushes a history entry, so Back returns to the previous tab.
 */
export function useHashTab(ids, fallback = ids[0]) {
  const [active, setActive] = useState(() => fromHash(ids, fallback));

  useEffect(() => {
    const onHashChange = () => setActive(fromHash(ids, fallback));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [ids, fallback]);

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
