import { useMemo } from 'react';
import NightPanel from './NightPanel';
import FateWheel from './FateWheel';
import TonightPick from './TonightPick';
import { formatNightDate } from '../../lib/format';
import { nightCountsLine, tonightPlayerCount } from '../../lib/night';
import { playStatsByGame } from '../../lib/plays';

export default function Tonight({ games, plays, nightApi, onLog, toast }) {
  const { night, lockGame } = nightApi;

  const playStats = useMemo(() => playStatsByGame(plays), [plays]);
  const count = tonightPlayerCount(night);
  const countWithMaybes = tonightPlayerCount(night, { includeMaybe: true });
  const pick = games.find((g) => g.id === night.lockedGameId) ?? null;
  const logged = pick ? plays.some((p) => p.gameId === pick.id && p.date === night.date) : false;

  const lockIn = (game) => {
    lockGame(game.id);
    toast.show({ message: `${game.title} is locked in for tonight.` });
  };

  const changePick = () => {
    const previous = pick;
    lockGame(null);
    if (previous) {
      toast.show({
        message: `Unlocked ${previous.title}.`,
        actionLabel: 'Undo',
        onAction: () => lockGame(previous.id),
      });
    }
  };

  // Opens the log dialog with tonight's date and everyone going.
  const logPlay = (game) => {
    const players = night.guests.filter((g) => g.status === 'going').map((g) => g.name);
    onLog({ gameId: game.id, date: night.date, players });
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <header>
        <h2 className="tabular font-display text-3xl font-bold">
          <span className="sr-only">Game night, </span>
          <time dateTime={night.date}>{formatNightDate(night.date)}</time>
        </h2>
        <p className="tabular mt-1 text-muted">
          {nightCountsLine(night)}
          {pick && (
            <>
              {' · playing '}
              <span className="font-semibold text-ink">{pick.title}</span>
            </>
          )}
        </p>
        {night.houseRule && (
          <p className="mt-2 max-w-prose text-sm text-ink">
            <span className="font-semibold text-danger">House rule:</span> {night.houseRule}
          </p>
        )}
      </header>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-6">
        <div className="lg:order-last">
          {pick ? (
            <TonightPick
              game={pick}
              stats={playStats.get(pick.id)}
              logged={logged}
              onLog={logPlay}
              onChange={changePick}
            />
          ) : (
            <FateWheel
              games={games}
              playStats={playStats}
              count={count}
              countWithMaybes={countWithMaybes}
              onLock={lockIn}
            />
          )}
        </div>
        <NightPanel nightApi={nightApi} toast={toast} />
      </div>
    </div>
  );
}
