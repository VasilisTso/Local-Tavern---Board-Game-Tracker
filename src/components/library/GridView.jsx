import { motion, useReducedMotion } from 'framer-motion';
import ItemObject from './ItemObject';
import { frontWidth } from '../../lib/cover';
import { dropIn } from '../../lib/motion';
import { itemLabel } from './objects';

/** Grid view: every item face-out, standing on the floor of an equal cell, title underneath. */
export default function GridView({ items, placeNames, openId, onOpen }) {
  const reduceMotion = useReducedMotion();
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
      {items.map((item, index) => (
        <motion.li key={item.id} className="min-w-0" {...dropIn(index, reduceMotion)}>
          <button
            type="button"
            onClick={() => onOpen(item, 'grid')}
            aria-label={itemLabel(item, placeNames.get(item.locationId))}
            aria-haspopup="dialog"
            className="lib-obj group block w-full rounded-md text-left"
          >
            <div className="lib-stage">
              <ItemObject
                item={item}
                origin="grid"
                width={frontWidth(item, '100cqw', '100cqh')}
                away={openId === item.id}
              />
            </div>
            <p aria-hidden="true" className="mt-3 line-clamp-2 font-display text-base leading-tight font-bold [font-variation-settings:'wdth'_92] group-hover:text-accent">
              {item.title}
            </p>
            {item.creator && (
              <p aria-hidden="true" className="mt-0.5 truncate text-sm text-muted">
                {item.creator}
              </p>
            )}
          </button>
        </motion.li>
      ))}
    </ul>
  );
}
