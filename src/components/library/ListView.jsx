import { motion, useReducedMotion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import ItemObject from './ItemObject';
import StatusBadge from './StatusBadge';
import { RatingStars } from './Rating';
import { kindLine } from '../../lib/shelf';
import { frontWidth } from '../../lib/cover';
import { rowIn } from '../../lib/motion';
import { iconBtn, iconBtnDanger } from '../ui';
import { itemLabel } from './objects';

/** List view: dense rows for scanning and quick edits. Edit and remove stay visible. */
export default function ListView({ items, placeNames, openId, onOpen, onEdit, onRemove }) {
  const reduceMotion = useReducedMotion();
  return (
    <ul className="divide-y divide-line border-y border-line">
      {items.map((item, index) => {
        const place = placeNames.get(item.locationId);
        const byline = [item.creator, item.year].filter(Boolean).join(' · ');
        return (
          <motion.li
            key={item.id}
            className="flex items-center gap-1 py-1.5"
            {...rowIn(index, reduceMotion)}
          >
            <button
              type="button"
              onClick={() => onOpen(item, 'list')}
              aria-label={itemLabel(item, place)}
              aria-haspopup="dialog"
              className="lib-obj group flex min-w-0 flex-1 items-center gap-3.5 rounded-md py-1 pr-2 text-left"
            >
              <div className="flex h-14 w-12 shrink-0 items-end justify-center">
                <ItemObject
                  item={item}
                  origin="list"
                  width={frontWidth(item, '3rem', '3.5rem')}
                  lift={false}
                  away={openId === item.id}
                />
              </div>
              <span aria-hidden="true" className="grid min-w-0 flex-1 gap-x-6 gap-y-0.5 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1fr)_11rem] md:items-center">
                <span className="min-w-0">
                  <span className="block truncate font-display text-base font-bold [font-variation-settings:'wdth'_92] group-hover:text-accent">
                    {item.title}
                  </span>
                  {byline ? (
                    <span className="block truncate text-sm text-muted">{byline}</span>
                  ) : (
                    <span className="block truncate text-sm text-muted md:hidden">{kindLine(item)}</span>
                  )}
                </span>
                <span className="hidden truncate text-sm text-muted md:block">{kindLine(item)}</span>
                <span className="truncate text-sm text-muted max-md:hidden">{place ?? 'No place yet'}</span>
                <span className="flex items-center gap-3 max-md:mt-1">
                  <StatusBadge status={item.status} />
                  {item.rating > 0 && <RatingStars value={item.rating} />}
                </span>
              </span>
            </button>
            <button type="button" onClick={() => onEdit(item)} aria-label={`Edit ${item.title}`} className={iconBtn}>
              <Pencil aria-hidden="true" className="size-4" />
            </button>
            <button type="button" onClick={() => onRemove(item)} aria-label={`Remove ${item.title}`} className={iconBtnDanger}>
              <Trash2 aria-hidden="true" className="size-4" />
            </button>
          </motion.li>
        );
      })}
    </ul>
  );
}
