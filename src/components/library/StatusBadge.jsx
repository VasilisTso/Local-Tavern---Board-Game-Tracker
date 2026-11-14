import { statusLabel } from '../../lib/kinds';

// Status colour stays on the token ramp: amber for "in progress", moss for finished,
// oxblood for dropped, muted for the rest.
const TONE = {
  active: 'text-accent',
  done: 'text-ok',
  dropped: 'text-danger',
  backlog: 'text-muted',
  wishlist: 'text-muted',
};

const DOT = {
  active: 'bg-accent',
  done: 'bg-ok',
  dropped: 'bg-danger',
  backlog: 'border border-muted',
  wishlist: 'border border-dashed border-muted',
};

export default function StatusBadge({ status, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap ${TONE[status] ?? 'text-muted'} ${className}`}>
      <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${DOT[status] ?? DOT.backlog}`} />
      {statusLabel(status)}
    </span>
  );
}
