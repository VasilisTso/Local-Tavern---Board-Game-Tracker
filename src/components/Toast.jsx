import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Bottom toast with an optional action (Undo). The timer pauses while the pointer or
 * keyboard focus is inside it. The live region is always mounted so screen readers
 * announce each new message.
 */
export default function Toast({ toast, onDismiss }) {
  const reduceMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!toast || paused) return undefined;
    const timer = window.setTimeout(onDismiss, toast.duration);
    return () => window.clearTimeout(timer);
  }, [toast, paused, onDismiss]);

  const runAction = () => {
    toast.onAction?.();
    onDismiss();
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <AnimatePresence
        mode="wait"
        onExitComplete={() => setPaused(false)}
      >
        {toast && (
          <motion.div
            key={toast.id}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            className="pointer-events-auto flex w-full max-w-md items-center gap-2 rounded-md border border-line-strong bg-raised py-1.5 pl-4 pr-1.5 text-sm text-ink shadow-[0_8px_24px_-8px_oklch(0.1_0.02_55/0.5)]"
          >
            <p className="min-w-0 flex-1 py-1.5">{toast.message}</p>
            {toast.actionLabel && (
              <button
                type="button"
                onClick={runAction}
                className="h-9 shrink-0 rounded-md px-3 font-semibold text-accent underline-offset-4 hover:bg-surface hover:underline"
              >
                {toast.actionLabel}
              </button>
            )}
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-ink"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
