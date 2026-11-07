import { Fragment, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { iconBtn } from './ui';

/**
 * Native modal `<dialog>` shell shared by every dialog in the app.
 * Esc, the backdrop and `onClose` all cancel. Children remount on every open, so forms
 * start fresh. Focus lands on `[data-autofocus]`, else the first field, else the first button.
 */
export default function Modal({ open, onClose, labelledBy, className = 'w-[min(34rem,calc(100vw-2rem))]', children }) {
  const ref = useRef(null);
  const [session, setSession] = useState(0);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setSession((s) => s + 1);
  }

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      const target =
        dialog.querySelector('[data-autofocus]') ??
        dialog.querySelector('input:not([type="hidden"]), select, textarea') ??
        dialog.querySelector('button');
      target?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open, session]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={`m-auto max-h-[min(42rem,calc(100dvh-2rem))] overflow-hidden rounded-md border border-line-strong bg-surface p-0 text-ink shadow-[0_24px_64px_-24px_oklch(0.08_0.02_55/0.7)] ${className}`}
    >
      {open && <Fragment key={session}>{children}</Fragment>}
    </dialog>
  );
}

/** Title row with a Close button, used at the top of a `Modal`. */
export function ModalHeader({ id, title, onClose }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
      <h2 id={id} className="font-display text-xl font-bold">
        {title}
      </h2>
      <button type="button" onClick={onClose} aria-label="Close" className={`${iconBtn} -mr-2`}>
        <X aria-hidden="true" className="size-5" />
      </button>
    </div>
  );
}

/** Bottom action row of a `Modal`. */
export function ModalActions({ children, className = '' }) {
  return <div className={`flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3 ${className}`}>{children}</div>;
}
