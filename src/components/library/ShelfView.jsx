import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Cloud, Layers } from 'lucide-react';
import ItemObject from './ItemObject';
import { dropIn } from '../../lib/motion';
import { standsFaceOut } from '../../lib/shelf';
import { itemLabel } from './objects';

const FACE_HEIGHT = '8.5rem';

/**
 * One place: a heading and its board. The objects form one roving-tabindex row: Tab enters at the
 * last focused object, arrow keys move along the board (across wrapped rows), Home/End jump.
 */
function Place({ group, openId, onOpen, wide }) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const refs = useRef([]);
  const current = Math.min(active, group.items.length - 1);
  const Icon = group.kind === 'digital' ? Cloud : Layers;
  const headingId = `place-${group.id}`;

  const onKeyDown = (event) => {
    const last = group.items.length - 1;
    const map = { ArrowRight: current + 1, ArrowDown: current + 1, ArrowLeft: current - 1, ArrowUp: current - 1, Home: 0, End: last };
    if (!(event.key in map)) return;
    event.preventDefault();
    const next = Math.max(0, Math.min(last, map[event.key]));
    setActive(next);
    refs.current[next]?.focus();
  };

  return (
    <section aria-labelledby={headingId} className={`min-w-0 space-y-3 ${wide ? 'lg:col-span-2' : ''}`}>
      <h3 id={headingId} className="flex items-baseline gap-2.5 font-display text-2xl font-[750] tracking-tight sm:text-3xl">
        <Icon aria-hidden="true" className="size-5 shrink-0 self-center text-muted" />
        <span className="min-w-0">{group.name}</span>
        <span className="tabular font-sans text-sm font-semibold text-muted">
          {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
        </span>
      </h3>

      {group.items.length === 0 ? (
        <div className="lib-board" style={{ '--slot': '4.5rem' }}>
          <p className="lib-slot items-center text-sm text-muted">Nothing here yet. Add an item and pick this place.</p>
        </div>
      ) : (
        <ul className="lib-board" aria-label={`${group.name}, ${group.items.length} items. Use arrow keys to move along the shelf.`} onKeyDown={onKeyDown}>
          {group.items.map((item, index) => {
            const face = standsFaceOut(item);
            return (
              <motion.li
                key={item.id}
                className={`lib-slot ${face ? 'lib-slot--face' : ''}`}
                {...dropIn(index, reduceMotion)}
              >
                <motion.button
                  ref={(el) => {
                    refs.current[index] = el;
                  }}
                  type="button"
                  tabIndex={index === current ? 0 : -1}
                  onFocus={() => setActive(index)}
                  onClick={() => onOpen(item, 'shelf')}
                  aria-label={itemLabel(item, group.id === 'none' ? null : group.name)}
                  aria-haspopup="dialog"
                  initial="rest"
                  animate="rest"
                  whileHover="lift"
                  whileFocus="lift"
                  className="lib-obj block rounded-[3px]"
                >
                  <ItemObject
                    item={item}
                    origin="shelf"
                    view={face ? 'front' : 'spine'}
                    height={FACE_HEIGHT}
                    away={openId === item.id}
                  />
                </motion.button>
              </motion.li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/** Places this small share a row with another on wide screens instead of leaving a bare board. */
const SMALL_PLACE = 8;

/** Shelf view: one titled board per place, objects standing on it. */
export default function ShelfView({ groups, openId, onOpen }) {
  return (
    <div className="grid gap-x-10 gap-y-12 lg:grid-cols-2">
      {groups.map((group) => (
        <Place key={group.id} group={group} openId={openId} onOpen={onOpen} wide={group.items.length > SMALL_PLACE} />
      ))}
    </div>
  );
}
