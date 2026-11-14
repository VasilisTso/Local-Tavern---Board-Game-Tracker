import { kindMeta, statusLabel } from '../../lib/kinds';

/**
 * Accessible name for an object button: covers are decorative, so the name carries what a
 * sighted owner reads off the object (title, creator, kind, place) plus anything notable.
 */
export function itemLabel(item, placeName) {
  const parts = [item.title];
  if (item.creator) parts.push(`by ${item.creator}`);
  parts.push(kindMeta(item.kind).label);
  if (placeName) parts.push(placeName);
  if (item.status === 'active' || item.status === 'wishlist') parts.push(statusLabel(item.status));
  if (item.lentTo) parts.push(`lent to ${item.lentTo}`);
  return parts.join(', ');
}

/** Shared-layout id that ties an object in a view to the cover in the detail sheet. */
export const objectLayoutId = (origin, id) => `obj:${origin}:${id}`;

/** Lift on hover or focus (variants propagate from the button around the object). */
export const liftVariants = { rest: { y: 0 }, lift: { y: -6 } };
