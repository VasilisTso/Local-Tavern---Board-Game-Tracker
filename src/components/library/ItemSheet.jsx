import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, useIsPresent, useReducedMotion } from 'framer-motion';
import { HandHelping, NotebookPen, Pencil, Trash2, X } from 'lucide-react';
import Cover from '../covers/Cover';
import { RatingInput } from './Rating';
import { objectLayoutId } from './objects';
import { frontAspect } from '../../lib/cover';
import { STATUSES, isDigitalFormat, kindMeta } from '../../lib/kinds';
import { kindLine } from '../../lib/shelf';
import { formatLength, formatPlayers, formatShortDate } from '../../lib/format';
import { DURATION, EASE_OUT_EXPO, SPRING, fade } from '../../lib/motion';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { btnPrimary, btnSecondary, chip, iconBtn } from '../ui';

// The panel and the cover layer share this geometry so the cover, which lives in its own fixed
// layer (outside the sliding, scrolling panel), lands exactly in the panel's cover slot.
const FRAME = 'fixed inset-x-0 top-[6dvh] bottom-0 md:inset-y-0 md:left-auto md:w-[min(30rem,100vw)]';
const SLOT = 'h-[11rem] md:h-[15rem]';
const SLOT_PAD = 'px-5 pt-5 md:px-7 md:pt-7';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

function Fact({ label, children }) {
  if (children == null || children === '' || children === false) return null;
  return (
    <div className="flex justify-between gap-4 border-b border-line py-2.5 text-sm">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="tabular min-w-0 text-right font-medium text-ink">{children}</dd>
    </div>
  );
}

/**
 * Detail sheet for one item: a side sheet on wide screens, a bottom sheet on phones. Modal: the
 * app behind it is inert, Esc and the backdrop close it, focus is trapped and goes back to the
 * object that opened it. The cover arrives from that object through a shared `layoutId`.
 */
export default function ItemSheet({ item, origin, fromSpine, placeName, stats, onClose, onUpdate, onEdit, onLog, onRemove }) {
  const titleId = useId();
  const reduceMotion = useReducedMotion();
  const wide = useMediaQuery('(min-width: 768px)');
  const isPresent = useIsPresent();
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const openerRef = useRef(null);
  const meta = kindMeta(item.kind);
  const aspect = frontAspect(item.kind, item.format);

  // Make the app inert while open; hand focus back as soon as the sheet starts leaving.
  useEffect(() => {
    if (!isPresent) return undefined;
    const root = document.getElementById('root');
    const panel = panelRef.current;
    openerRef.current = document.activeElement;
    root?.setAttribute('inert', '');
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      root?.removeAttribute('inert');
      const active = document.activeElement;
      if (!active || active === document.body || panel?.contains(active)) {
        openerRef.current?.focus?.({ preventScroll: true });
      }
    };
  }, [isPresent]);

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const nodes = [...panelRef.current.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null);
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const panelMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: fade }
    : {
        initial: wide ? { x: '100%' } : { y: '100%' },
        animate: { x: 0, y: 0 },
        exit: wide ? { x: '100%' } : { y: '100%' },
        transition: SPRING.sheet,
      };

  const players = meta.fields.includes('players') ? formatPlayers(item.minPlayers, item.maxPlayers) : null;
  const physical = !isDigitalFormat(item.format);

  return createPortal(
    <div className="fixed inset-0 z-40" onKeyDown={onKeyDown}>
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-[oklch(0.12_0.02_55/0.6)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: DURATION.base, ease: EASE_OUT_EXPO }}
        onClick={onClose}
      />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`${FRAME} flex flex-col overflow-hidden rounded-t-lg border border-line-strong bg-surface text-ink shadow-[var(--sheet-shadow)] md:rounded-l-lg md:rounded-tr-none md:border-r-0`}
        {...panelMotion}
      >
        <div className={`relative flex shrink-0 justify-end ${SLOT_PAD} pb-5`}>
          {/* Space the cover layer draws into. */}
          <div aria-hidden="true" className={`${SLOT} flex-1`} />
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className={`${iconBtn} -mt-2 -mr-2 self-start`}>
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 md:px-7">
          <h2 id={titleId} className="font-display text-4xl leading-none font-extrabold tracking-tight md:text-[3.052rem]">
            {item.title}
          </h2>
          <p className="mt-2 text-muted">
            {[item.creator, item.year].filter(Boolean).join(' · ') || kindLine(item)}
          </p>
          {(item.creator || item.year) && <p className="mt-0.5 text-sm text-muted">{kindLine(item)}</p>}

          {item.lentTo && physical && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-md bg-raised px-3 py-2 text-sm font-semibold">
              <HandHelping aria-hidden="true" className="size-4 text-accent" />
              Lent to {item.lentTo}
            </p>
          )}

          <fieldset className="mt-6">
            <legend className="mb-2 text-sm font-semibold">Status</legend>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => (
                <label key={s.id} className="relative">
                  <input
                    type="radio"
                    name={`${titleId}-status`}
                    checked={item.status === s.id}
                    onChange={() => onUpdate({ status: s.id })}
                    className="peer sr-only"
                  />
                  <span className={chip}>{s.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-5">
            <RatingInput
              name={`${titleId}-rating`}
              value={item.rating}
              onChange={(rating) => onUpdate({ rating })}
              legendClassName="text-sm font-semibold"
            />
          </div>

          <dl className="mt-6 border-t border-line">
            <Fact label="Place">{placeName ?? 'No place yet'}</Fact>
            <Fact label={item.kind === 'book' && item.format !== 'audio' ? 'Pages' : 'Length'}>{formatLength(item)}</Fact>
            <Fact label="Players">{players}</Fact>
            <Fact label="Platform">{item.platform}</Fact>
            <Fact label="Used">
              {stats?.count ? (
                <>
                  {stats.count}&times; · last <time dateTime={stats.last}>{formatShortDate(stats.last)}</time>
                </>
              ) : (
                'Not yet'
              )}
            </Fact>
            <Fact label="Added">
              <time dateTime={item.addedAt}>{formatShortDate(item.addedAt)}</time>
            </Fact>
          </dl>

          {item.tags.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Tags">
              {item.tags.map((tag) => (
                <li key={tag} className="rounded-sm bg-raised px-2 py-1 text-xs font-medium text-muted">
                  {tag}
                </li>
              ))}
            </ul>
          )}

          {item.notes && <p className="mt-5 text-sm whitespace-pre-line text-ink">{item.notes}</p>}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 border-t border-line px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-7">
          <button type="button" onClick={onLog} className={btnPrimary}>
            <NotebookPen aria-hidden="true" className="size-4" />
            Log
          </button>
          <button type="button" onClick={onEdit} className={btnSecondary}>
            <Pencil aria-hidden="true" className="size-4" />
            Edit
          </button>
          <button type="button" onClick={onRemove} className={`${btnSecondary} hover:text-danger`}>
            <Trash2 aria-hidden="true" className="size-4" />
            Remove
          </button>
        </div>
      </motion.div>

      {/* Cover layer: same frame as the panel, but fixed, unclipped and not sliding, so the shared
          layout animation has a stable target. */}
      <div aria-hidden="true" className={`${FRAME} pointer-events-none ${SLOT_PAD}`}>
        <div className={`${SLOT} flex items-end`}>
          <motion.div
            layoutId={reduceMotion ? undefined : objectLayoutId(origin, item.id)}
            transition={reduceMotion ? fade : SPRING.pull}
            initial={reduceMotion ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : undefined}
            className="relative"
            style={{ width: `min(100%, calc(var(--slot-h) * ${aspect}))`, aspectRatio: aspect, '--slot-h': wide ? '15rem' : '11rem' }}
          >
            <Cover item={item} className="size-full" style={{ filter: 'var(--obj-pulled)' }} />
            {fromSpine && !reduceMotion && (
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 1 }}
                transition={{ duration: DURATION.slow, ease: EASE_OUT_EXPO, delay: 0.04 }}
              >
                <Cover item={item} view="spine" style={{ width: '100%', height: '100%', filter: 'none' }} />
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
