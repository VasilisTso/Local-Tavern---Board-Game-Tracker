import { motion, useReducedMotion } from 'framer-motion';
import ItemObject from './ItemObject';
import { dropIn } from '../../lib/motion';
import { frontAspect } from '../../lib/cover';
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
      <ul className="-mx-4 flex snap-x snap-proximity items-end gap-6 overflow-x-auto px-4 pt-2 pb-3 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {items.map((item, index) => (
          <motion.li key={item.id} className="w-36 shrink-0 snap-start" {...dropIn(index, reduceMotion)}>
            <motion.button
              type="button"
              onClick={() => onOpen(item, 'now')}
              aria-label={itemLabel(item, placeNames.get(item.locationId))}
              aria-haspopup="dialog"
              initial="rest"
              animate="rest"
              whileHover="lift"
              whileFocus="lift"
              className="lib-obj group flex w-full flex-col text-left"
            >
              <div className="flex h-36 items-end">
                <ItemObject
                  item={item}
                  origin="now"
                  width={`min(9rem, calc(9rem * ${frontAspect(item.kind, item.format)}))`}
                  away={openId === item.id}
                />
              </div>
              <span aria-hidden="true" className="mt-2.5 line-clamp-2 font-display text-base leading-tight font-bold [font-variation-settings:'wdth'_92] group-hover:text-accent">
                {item.title}
              </span>
              <span aria-hidden="true" className="mt-0.5 truncate text-xs font-semibold text-muted">
                {kindMeta(item.kind).label}
              </span>
            </motion.button>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
