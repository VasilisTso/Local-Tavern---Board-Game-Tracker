import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Plus } from 'lucide-react';
import ShelfToolbar from './ShelfToolbar';
import GameCard from './GameCard';
import GameDialog from './GameDialog';
import { DEFAULT_FILTERS, isFiltered, matchesFilters, sortGames, tagsByUse } from '../../lib/shelf';
import { playStatsByGame } from '../../lib/plays';
import { tonightPlayerCount } from '../../lib/night';
import { btnPrimary, btnSecondary } from '../ui';

const EASE = [0.16, 1, 0.3, 1];

export default function Shelf({ gamesApi, plays, night, toast }) {
  const { games, addGame, updateGame, removeGame, restoreGame } = gamesApi;
  const reduceMotion = useReducedMotion();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [dialog, setDialog] = useState({ open: false, game: null });

  const tonightCount = tonightPlayerCount(night);
  const playStats = useMemo(() => playStatsByGame(plays), [plays]);
  const tags = useMemo(() => tagsByUse(games), [games]);
  const visible = useMemo(
    () =>
      sortGames(
        games.filter((g) => matchesFilters(g, filters, { tonightCount })),
        filters.sort,
        playStats,
      ),
    [games, filters, tonightCount, playStats],
  );
  const filtered = isFiltered(filters);
  const clearFilters = () => setFilters((f) => ({ ...DEFAULT_FILTERS, sort: f.sort }));

  // Re-key the list on filter change so the stagger replays; edits/removals animate in place.
  const filterKey = JSON.stringify([filters.query.trim(), filters.players, filters.time, filters.tags, filters.sort]);

  const openAdd = () => setDialog({ open: true, game: null });
  const openEdit = (game) => setDialog({ open: true, game });
  const closeDialog = () => setDialog((d) => ({ ...d, open: false }));

  const save = (values) => {
    if (dialog.game) {
      updateGame(dialog.game.id, values);
      toast.show({ message: `Saved changes to ${values.title}.` });
    } else {
      const added = addGame(values);
      if (added && !matchesFilters(added, filters, { tonightCount })) {
        toast.show({
          message: `Added ${added.title}. Your filters hide it.`,
          actionLabel: 'Show all',
          onAction: clearFilters,
        });
      } else if (added) {
        toast.show({ message: `Added ${added.title} to the shelf.` });
      }
    }
    closeDialog();
  };

  const remove = (game) => {
    const removed = removeGame(game.id);
    if (!removed) return;
    toast.show({
      message: `Removed ${game.title}.`,
      actionLabel: 'Undo',
      onAction: () => restoreGame(removed),
    });
  };

  const item = (index) =>
    reduceMotion
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.12 } }
      : {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0, transition: { duration: 0.32, ease: EASE, delay: Math.min(index, 12) * 0.025 } },
          exit: { opacity: 0, scale: 0.97, transition: { duration: 0.16 } },
          layout: 'position',
        };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold">
          The shelf{' '}
          <span className="tabular font-sans text-base font-semibold text-muted">
            {games.length} {games.length === 1 ? 'game' : 'games'}
          </span>
        </h2>
        <button type="button" onClick={openAdd} className={btnPrimary}>
          <Plus aria-hidden="true" className="size-4" strokeWidth={2.5} />
          Add game
        </button>
      </div>

      {games.length > 0 && (
        <ShelfToolbar filters={filters} onChange={setFilters} tonightCount={tonightCount} tags={tags} />
      )}

      {filtered && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-3 text-sm text-muted">
          <p className="tabular" aria-live="polite">
            Showing {visible.length} of {games.length}
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="font-semibold text-accent underline underline-offset-4 hover:no-underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {games.length === 0 ? (
        <div className="rounded-md border border-dashed border-line-strong px-6 py-12 text-center">
          <h3 className="font-display text-xl font-bold">The shelf is bare</h3>
          <p className="mx-auto mt-1 max-w-sm text-muted">
            Add the games you own. They show up here, on the Fate Wheel, and in the ledger.
          </p>
          <button type="button" onClick={openAdd} className={`${btnPrimary} mt-5`}>
            <Plus aria-hidden="true" className="size-4" strokeWidth={2.5} />
            Add your first game
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-md border border-dashed border-line-strong px-6 py-10 text-center">
          <h3 className="font-display text-xl font-bold">Nothing on the shelf fits</h3>
          <p className="mx-auto mt-1 max-w-sm text-muted">
            {filters.players === 'tonight'
              ? `No game seats exactly ${tonightCount} tonight. Try another player count or clear the filters.`
              : 'Loosen a filter or clear them all.'}
          </p>
          <button type="button" onClick={clearFilters} className={`${btnSecondary} mt-5`}>
            Clear filters
          </button>
        </div>
      ) : (
        <ul key={filterKey} className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence initial={true} mode="popLayout">
            {visible.map((game, index) => (
              <motion.li key={game.id} {...item(index)}>
                <GameCard
                  game={game}
                  stats={playStats.get(game.id)}
                  isTonightPick={night.lockedGameId === game.id}
                  onEdit={openEdit}
                  onRemove={remove}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <GameDialog
        open={dialog.open}
        game={dialog.game}
        games={games}
        allTags={tags.map((t) => t.tag)}
        onSave={save}
        onClose={closeDialog}
      />
    </div>
  );
}
