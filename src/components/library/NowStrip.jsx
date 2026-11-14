import { motion, useReducedMotion } from 'framer-motion';
import ItemObject from './ItemObject';
import { dropIn } from '../../lib/motion';
import { frontWidth } from '../../lib/cover';
import { kindMeta } from '../../lib/kinds';
import { itemLabel } from './objects';

/** "Now": what the owner is in the middle of (status active), face-out, newest first. */
export default function NowStrip({ items, placeNames, openId, onOpen }) {
  const reduceMotion = useReducedMotion();
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="now-heading" className="space-y-3">
      <h2 id="now-heading" className="flex items-baseline gap-2.5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        Now
        <span className="tabular font-sans text-sm font-semibold text-muted">{items.length} in progress</span>
      </h2>
      <ul className="-mx-4 flex snap-x snap-proximity items-end gap-5 [--now:7rem] sm:gap-6 sm:[--now:9rem] overflow-x-auto scroll-px-4 px-4 pt-2 pb-3 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {items.map((item, index) => (
          <motion.li key={item.id} className="w-(--now) shrink-0 snap-start" {...dropIn(index, reduceMotion)}>
            <button
              type="button"
              onClick={() => onOpen(item, 'now')}
              aria-label={itemLabel(item, placeNames.get(item.locationId))}
              aria-haspopup="dialog"
              className="lib-obj group flex w-full flex-col text-left"
            >
              <div className="flex h-(--now) items-end">
                <ItemObject
                  item={item}
                  origin="now"
                  width={frontWidth(item, 'var(--now)')}
                  away={openId === item.id}
                />
              </div>
              <span
                aria-hidden="true"
                className="mt-2 line-clamp-2 font-display text-sm leading-tight sm:mt-2.5 sm:text-base font-bold [font-variation-settings:'wdth'_92] group-hover:text-accent"
              >
                {item.title}
              </span>
              <span aria-hidden="true" className="mt-0.5 truncate text-xs font-semibold text-muted">
                {kindMeta(item.kind).label}
              </span>
            </button>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
