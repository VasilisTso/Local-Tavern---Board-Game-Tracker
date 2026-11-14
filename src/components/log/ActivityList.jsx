import { useMemo } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { collapse } from '../../lib/motion';
import { Pencil, Trash2, Trophy } from 'lucide-react';
import Cover from '../covers/Cover';
import { RatingStars } from '../library/Rating';
import { activityVerb } from '../../lib/kinds';
import { groupByMonth } from '../../lib/log';
import { parseLocal } from '../../lib/format';
import { iconBtn, iconBtnDanger } from '../ui';

// Milestones stand out from ordinary sessions.
const TYPE_TONE = {
  started: 'text-accent',
  finished: 'text-ok',
  session: 'text-muted',
};

const listFormat = (names) =>
  typeof Intl.ListFormat === 'function'
    ? new Intl.ListFormat(undefined, { style: 'long', type: 'conjunction' }).format(names)
    : names.join(', ');

function EntryDate({ date }) {
  const d = parseLocal(date);
  if (!d) return <span className="w-11 shrink-0" />;
  return (
    <time dateTime={date} className="tabular flex w-11 shrink-0 flex-col items-center pt-0.5 leading-none">
      <span className="text-xs font-semibold text-muted uppercase">
        {d.toLocaleDateString(undefined, { weekday: 'short' })}
      </span>
      <span className="mt-1 font-display text-2xl font-bold text-ink">{d.getDate()}</span>
    </time>
  );
}

function EntryRow({ entry, item, onEdit, onRemove }) {
  const title = item?.title ?? 'Something no longer in the library';
  const time = parseLocal(entry.date)?.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const verb = activityVerb(item?.kind, entry.type);
  return (
    <article className="flex gap-3 py-3 sm:gap-4">
      <EntryDate date={entry.date} />
      {item ? (
        <Cover item={item} className="w-10 shrink-0 self-start" />
      ) : (
        <div aria-hidden="true" className="aspect-[3/4] w-10 shrink-0 self-start rounded-sm border border-dashed border-line-strong" />
      )}

      <div className="min-w-0 flex-1">
        <h4 className={`font-display text-lg leading-tight font-bold ${item ? 'text-ink' : 'text-muted italic'}`}>
          <span className={`mr-1.5 font-sans text-xs font-bold tracking-wide uppercase ${TYPE_TONE[entry.type]}`}>{verb}</span>
          {title}
        </h4>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-sm text-muted">
          {time && <span className="tabular">{time}</span>}
          {entry.players.length > 0 && (
            <span>
              {time && '· '}with {listFormat(entry.players)}
            </span>
          )}
          {entry.rating > 0 && (
            <>
              {(time || entry.players.length > 0) && <span aria-hidden="true">·</span>}
              <RatingStars value={entry.rating} />
            </>
          )}
        </p>
        {entry.winners.length > 0 && (
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-ink">
            <Trophy aria-hidden="true" className="size-3.5 shrink-0 text-accent" />
            {listFormat(entry.winners)} won
          </p>
        )}
        {entry.note && <p className="mt-1 max-w-prose text-sm text-muted italic">“{entry.note}”</p>}
      </div>

      <div className="-mt-1 -mr-1 flex shrink-0 flex-col sm:flex-row">
        <button type="button" onClick={() => onEdit(entry)} aria-label={`Edit the ${title} entry`} className={iconBtn}>
          <Pencil aria-hidden="true" className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => onRemove(entry, title)}
          aria-label={`Delete the ${title} entry from the log`}
          className={iconBtnDanger}
        >
          <Trash2 aria-hidden="true" className="size-4" />
        </button>
      </div>
    </article>
  );
}

/** The activity log, newest first, one section per month. */
export default function ActivityList({ activity, items, onEdit, onRemove }) {
  const reduceMotion = useReducedMotion();
  const itemById = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const months = useMemo(() => groupByMonth(activity), [activity]);

  const rowMotion = collapse(reduceMotion);

  return (
    <div className="space-y-6">
      {months.map((month) => (
        <section key={month.key} aria-labelledby={`month-${month.key}`}>
          <h3
            id={`month-${month.key}`}
            className="flex items-baseline justify-between gap-3 border-b border-line-strong pb-1.5 font-display text-xl font-bold"
          >
            {month.label}
            <span className="tabular font-sans text-sm font-semibold text-muted">
              {month.entries.length} {month.entries.length === 1 ? 'entry' : 'entries'}
            </span>
          </h3>
          <ul className="divide-y divide-line">
            <AnimatePresence initial={false}>
              {month.entries.map((entry) => (
                <motion.li key={entry.id} {...rowMotion} className="overflow-hidden">
                  <EntryRow entry={entry} item={itemById.get(entry.itemId)} onEdit={onEdit} onRemove={onRemove} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </section>
      ))}
    </div>
  );
}
