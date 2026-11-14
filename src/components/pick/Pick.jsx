import { useCallback, useMemo, useState } from 'react';
import { Check, Library as LibraryIcon, Lock, NotebookPen, Play, Users } from 'lucide-react';
import NightPanel from './NightPanel';
import PickWheel from './PickWheel';
import PickFilters from './PickFilters';
import LockedPick from './LockedPick';
import { usePersistentState } from '../../hooks/usePersistentState';
import { KEYS } from '../../lib/storage';
import { formatNightDate } from '../../lib/format';
import { nightCountsLine, tonightPlayerCount } from '../../lib/night';
import { playStatsByGame } from '../../lib/plays';
import { tagsByUse } from '../../lib/shelf';
import { clearPickFilters, defaultPick, neglectWeight, normalizePick, pickFilterCount, wheelPool } from '../../lib/wheel';
import { btnPrimary, btnSecondary } from '../ui';

function NightToggle({ on, onToggle }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={`inline-flex h-10 shrink-0 items-center gap-2.5 rounded-md border px-3 text-sm font-semibold transition-colors duration-150 ${
        on ? 'border-accent bg-raised text-ink' : 'border-line-strong text-muted hover:text-ink'
      }`}
    >
      <Users aria-hidden="true" className="size-4" />
      Game night
      <span
        aria-hidden="true"
        className={`relative h-5 w-9 rounded-full transition-colors duration-150 ${on ? 'bg-accent-fill' : 'bg-line-strong'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-bg transition-transform duration-150 motion-reduce:transition-none ${
            on ? 'translate-x-4' : ''
          }`}
        />
      </span>
    </button>
  );
}

function EmptyState({ title, body, actions }) {
  return (
    <div className="rounded-md border border-dashed border-line-strong bg-surface px-5 py-12 text-center">
      <p className="font-display text-2xl font-bold">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-muted">{body}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {actions.map((a) =>
          a.href ? (
            <a key={a.label} href={a.href} className={`${btnSecondary} no-underline`}>
              <LibraryIcon aria-hidden="true" className="size-4" />
              {a.label}
            </a>
          ) : (
            <button key={a.label} type="button" onClick={a.onClick} className={btnSecondary}>
              {a.label}
            </button>
          ),
        )}
      </div>
    </div>
  );
}

/** Pick tab: the wheel over a filtered pool, with an optional game night mode. */
export default function Pick({ items, activity, locations, itemsApi, nightApi, onLog, toast }) {
  const [pick, setPick] = usePersistentState(KEYS.pick, defaultPick, normalizePick);
  const { night, lockItem } = nightApi;
  const nightMode = pick.nightMode;

  const useStats = useMemo(() => playStatsByGame(activity), [activity]);
  const [now] = useState(() => Date.now());
  const tags = useMemo(() => tagsByUse(items), [items]);

  // A removed place falls back to every place.
  const effective = useMemo(
    () => (pick.location === 'any' || locations.some((l) => l.id === pick.location) ? pick : { ...pick, location: 'any' }),
    [pick, locations],
  );

  const count = tonightPlayerCount(night);
  const countWithMaybes = tonightPlayerCount(night, { includeMaybe: true });
  const hasMaybes = countWithMaybes > count;
  const source = pick.nightSource === 'maybes' && !hasMaybes ? 'fits' : pick.nightSource;
  const players = !nightMode || source === 'any' ? null : source === 'maybes' ? countWithMaybes : count;

  const pool = useMemo(() => wheelPool(items, effective, { players }), [items, effective, players]);

  const weightOf = useCallback(
    (item) => (pick.favorNeglected ? neglectWeight(item, useStats.get(item.id)?.last, now) : 1),
    [pick.favorNeglected, useStats, now],
  );

  // Clears the wheel's result whenever the filters change.
  const resetKey = JSON.stringify([effective, players]);

  const setSource = (nightSource) => setPick({ ...pick, nightSource });
  const toggleNight = () => setPick({ ...pick, nightMode: !nightMode });

  const locked = nightMode ? (items.find((i) => i.id === night.lockedItemId) ?? null) : null;
  const logged = locked ? activity.some((a) => a.itemId === locked.id && a.date === night.date) : false;

  const lockIn = (item) => {
    lockItem(item.id);
    toast.show({ message: `${item.title} is locked in for tonight.` });
  };

  const changePick = () => {
    const previous = locked;
    lockItem(null);
    if (previous) {
      toast.show({
        message: `Unlocked ${previous.title}.`,
        actionLabel: 'Undo',
        onAction: () => lockItem(previous.id),
      });
    }
  };

  const logSession = (item) => {
    const names = night.guests.filter((g) => g.status === 'going').map((g) => g.name);
    onLog({
      itemId: item.id,
      type: 'session',
      date: night.date,
      players: names,
    });
  };

  const start = (item) => {
    const previous = item.status;
    itemsApi.updateItem(item.id, { status: 'active' });
    toast.show({
      message: `Started ${item.title}. It's on your Now shelf.`,
      actionLabel: 'Undo',
      onAction: () => itemsApi.updateItem(item.id, { status: previous }),
    });
  };

  const renderActions = (winner) => {
    if (nightMode) {
      return (
        <button type="button" onClick={() => lockIn(winner)} className={btnPrimary}>
          <Lock aria-hidden="true" className="size-4" />
          Lock in for tonight
        </button>
      );
    }
    const current = items.find((i) => i.id === winner.id) ?? winner;
    const logIt = (
      <button type="button" onClick={() => onLog({ itemId: current.id })} className={btnSecondary}>
        <NotebookPen aria-hidden="true" className="size-4" />
        Log it
      </button>
    );
    if (current.status === 'active') {
      return (
        <>
          <p className="mr-1 flex items-center gap-1.5 text-sm font-semibold text-ok">
            <Check aria-hidden="true" className="size-4" strokeWidth={3} />
            In progress
          </p>
          {logIt}
        </>
      );
    }
    return (
      <>
        <button type="button" onClick={() => start(current)} className={btnPrimary}>
          <Play aria-hidden="true" className="size-4" />
          Start it
        </button>
        {logIt}
      </>
    );
  };

  const nightSources = [
    { id: 'fits', label: `Seats ${count}` },
    ...(hasMaybes ? [{ id: 'maybes', label: `Seats ${countWithMaybes} with maybes` }] : []),
    { id: 'any', label: 'Any count' },
  ];

  let empty = null;
  if (items.length === 0) {
    empty = {
      title: 'Nothing to spin yet',
      body: 'Add a few things to the library and they land on the wheel.',
      actions: [{ label: 'Go to the library', href: '#library' }],
    };
  } else if (pool.length === 0) {
    const actions = [];
    if (players != null && hasMaybes && source === 'fits') {
      actions.push({
        label: `Try ${countWithMaybes} with maybes`,
        onClick: () => setSource('maybes'),
      });
    }
    if (players != null)
      actions.push({
        label: 'Any player count',
        onClick: () => setSource('any'),
      });
    if (pickFilterCount(effective) > 0) {
      actions.push({
        label: 'Reset filters',
        onClick: () => setPick(clearPickFilters(pick)),
      });
    }
    empty = {
      title: players != null ? `Nothing seats ${players}` : 'Nothing fits those filters',
      body:
        players != null ? 'No board or video game in this pool takes that many players.' : 'Loosen a filter, or pick a different status.',
      actions,
    };
  }

  const stage = locked ? (
    <LockedPick item={locked} stats={useStats.get(locked.id)} logged={logged} onLog={logSession} onChange={changePick} />
  ) : empty ? (
    <EmptyState {...empty} />
  ) : (
    <PickWheel pool={pool} weightOf={weightOf} resetKey={resetKey} renderActions={renderActions} />
  );

  const filters = (
    <PickFilters
      pick={effective}
      onChange={setPick}
      locations={locations}
      tags={tags}
      night={nightMode ? { sources: nightSources, source, onSource: setSource } : null}
    />
  );
  const showFilters = !locked && items.length > 0;

  return (
    <div className={`space-y-5 sm:space-y-6 ${nightMode ? '' : 'mx-auto max-w-xl'}`}>
      <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          {nightMode ? (
            <>
              <h2 className="tabular font-display text-3xl font-extrabold sm:text-4xl">
                <span className="sr-only">Game night, </span>
                <time dateTime={night.date}>{formatNightDate(night.date)}</time>
              </h2>
              <p className="tabular mt-1 text-muted">
                {nightCountsLine(night)}
                {locked && (
                  <>
                    {' · playing '}
                    <span className="font-semibold text-ink">{locked.title}</span>
                  </>
                )}
              </p>
              {night.houseRule && (
                <p className="mt-2 max-w-prose text-sm text-ink">
                  <span className="font-semibold text-muted">House rule:</span> {night.houseRule}
                </p>
              )}
            </>
          ) : (
            <>
              <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Can't decide?</h2>
              <p className="mt-1 text-muted">
                {items.length === 0 ? 'Spin the wheel once the library has something in it.' : 'Spin and let the wheel choose.'}
              </p>
            </>
          )}
        </div>
        <NightToggle on={nightMode} onToggle={toggleNight} />
      </header>

      {nightMode ? (
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-6">
          <div className="lg:order-last">{stage}</div>
          <div className="space-y-5 lg:space-y-6">
            <NightPanel nightApi={nightApi} toast={toast} />
            {showFilters && filters}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {showFilters && filters}
          {stage}
        </div>
      )}
    </div>
  );
}
