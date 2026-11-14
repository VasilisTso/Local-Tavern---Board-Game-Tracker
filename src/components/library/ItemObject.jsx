import { motion, useReducedMotion } from 'framer-motion';
import { HandHelping } from 'lucide-react';
import Cover from '../covers/Cover';
import { frontAspect, spineSize } from '../../lib/cover';
import { SPRING } from '../../lib/motion';
import { objectLayoutId } from './objects';

/**
 * An item drawn as its object inside a view (shelf, grid, list, Now). While the item is open in
 * the detail sheet (`away`), only a ghost of the same size stays behind and the sheet owns the
 * shared `layoutId`, so the object travels into the sheet and back.
 *
 * Size: `view="spine"` uses the spine's natural size; `view="front"` takes `height` (CSS length)
 * and derives the width from the object's aspect ratio, or `width` when given instead.
 */
export default function ItemObject({ item, view = 'front', origin, away = false, height, width, lift = true, className = '' }) {
  const reduceMotion = useReducedMotion();
  const aspect = frontAspect(item.kind, item.format);

  let size;
  if (view === 'spine') {
    const s = spineSize(item);
    size = { width: `${s.width}rem`, height: `${s.height}rem` };
  } else if (width) {
    size = { width, aspectRatio: aspect };
  } else {
    size = { width: `calc(${height} * ${aspect})`, height };
  }

  if (away) return <div aria-hidden="true" className={`lib-ghost shrink-0 ${className}`} style={size} />;

  return (
    <motion.div
      layoutId={reduceMotion ? undefined : objectLayoutId(origin, item.id)}
      transition={SPRING.pull}
      className={`relative shrink-0 ${lift ? 'lib-lift' : ''} ${className}`}
      style={size}
    >
      <Cover item={item} view={view} className="size-full" style={view === 'spine' ? { width: '100%', height: '100%' } : undefined} />
      {item.lentTo && (
        <span className="lib-lent" aria-hidden="true">
          <HandHelping className="size-3" strokeWidth={2.5} />
        </span>
      )}
    </motion.div>
  );
}
