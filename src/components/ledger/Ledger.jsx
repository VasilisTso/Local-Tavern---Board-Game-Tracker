import { NotebookPen } from 'lucide-react';
import PlayList from './PlayList';
import StatsPanel from './StatsPanel';
import { btnPrimary } from '../ui';

/** Ledger tab: the play log beside the stats it feeds. */
export default function Ledger({ games, playsApi, onLog, onEdit, toast }) {
  const { activity: plays, removeActivity: removePlay, restoreActivity: restorePlay } = playsApi;
  const noGames = games.length === 0;

  const remove = (play, title) => {
    const removed = removePlay(play.id);
    if (!removed) return;
    toast.show({
      message: `Deleted the ${title} play.`,
      actionLabel: 'Undo',
      onAction: () => restorePlay(removed),
    });
  };

  const logButton = (extra = '') => (
    <button type="button" onClick={() => onLog()} disabled={noGames} className={`${btnPrimary} ${extra}`}>
      <NotebookPen aria-hidden="true" className="size-4" />
      Log a play
    </button>
  );

  if (plays.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-line-strong px-6 py-12 text-center">
        <h2 className="font-display text-2xl font-bold">The ledger is empty</h2>
        <p className="mx-auto mt-1 max-w-sm text-muted">
          {noGames
            ? 'Put a game on the shelf first, then log the nights you play it.'
            : 'Log a play after a game night. Who played, who won, and what gathers dust show up here.'}
        </p>
        {noGames ? (
          <a href="#shelf" className={`${btnPrimary} mt-5 no-underline`}>
            Go to the shelf
          </a>
        ) : (
          logButton('mt-5')
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold">
          The ledger{' '}
          <span className="tabular font-sans text-base font-semibold text-muted">
            {plays.length} {plays.length === 1 ? 'play' : 'plays'}
          </span>
        </h2>
        {logButton()}
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
        <aside aria-label="Stats" className="lg:order-last">
          <StatsPanel plays={plays} games={games} />
        </aside>
        <PlayList plays={plays} games={games} onEdit={onEdit} onRemove={remove} />
      </div>
    </div>
  );
}
