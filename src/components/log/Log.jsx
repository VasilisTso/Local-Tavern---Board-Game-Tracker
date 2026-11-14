import { useMemo, useState } from 'react';
import { NotebookPen } from 'lucide-react';
import ActivityList from './ActivityList';
import LogStats from './LogStats';
import { KindChips } from '../Chips';
import { filterActivityByKind } from '../../lib/log';
import { btnPrimary, btnSecondary } from '../ui';

/** Log tab: the activity log beside the stats it feeds, both filtered by kind. */
export default function Log({ items, activityApi, onLog, onEdit, toast }) {
  const { activity, removeActivity, restoreActivity } = activityApi;
  const [kinds, setKinds] = useState([]);
  const empty = items.length === 0;
  const shown = useMemo(() => filterActivityByKind(activity, items, kinds), [activity, items, kinds]);

  const remove = (entry, title) => {
    const removed = removeActivity(entry.id);
    if (!removed) return;
    toast.show({
      message: `Deleted the ${title} entry.`,
      actionLabel: 'Undo',
      onAction: () => restoreActivity(removed),
    });
  };

  const logButton = (extra = '') => (
    <button type="button" onClick={() => onLog()} disabled={empty} className={`${btnPrimary} ${extra}`}>
      <NotebookPen aria-hidden="true" className="size-4" />
      Log something
    </button>
  );

  if (activity.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-line-strong px-6 py-12 text-center">
        <h2 className="font-display text-2xl font-bold">Nothing logged yet</h2>
        <p className="mx-auto mt-1 max-w-sm text-muted">
          {empty
            ? 'Put something in the library first, then log what you play, read, watch and hear.'
            : 'Log when you start, finish or sit down with something. What you finish, how long it took and what gathers dust show up here.'}
        </p>
        {empty ? (
          <a href="#library" className={`${btnPrimary} mt-5 no-underline`}>
            Go to the library
          </a>
        ) : (
          logButton('mt-5')
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
          The log{' '}
          <span className="tabular font-sans text-base font-semibold text-muted">
            {shown.length} {shown.length === 1 ? 'entry' : 'entries'}
          </span>
        </h2>
        {logButton()}
      </div>

      <KindChips value={kinds} onChange={setKinds} legend="Show entries for these kinds" />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
        <aside aria-label="Stats" className="lg:order-last">
          <LogStats activity={activity} items={items} kinds={kinds} />
        </aside>
        {shown.length === 0 ? (
          <div className="rounded-md border border-dashed border-line-strong px-5 py-10 text-center">
            <p className="font-display text-xl font-bold">Nothing logged for these kinds</p>
            <button type="button" onClick={() => setKinds([])} className={`${btnSecondary} mt-4`}>
              Show every kind
            </button>
          </div>
        ) : (
          <ActivityList activity={shown} items={items} onEdit={onEdit} onRemove={remove} />
        )}
      </div>
    </div>
  );
}
