import { useCallback, useState } from 'react';

let nextId = 1;

/**
 * One toast at a time; a new one replaces the current one.
 * `show({ message, actionLabel?, onAction?, duration? })`
 */
export function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((options) => setToast({ duration: 6000, ...options, id: nextId++ }), []);
  const dismiss = useCallback(() => setToast(null), []);
  return { toast, show, dismiss };
}
