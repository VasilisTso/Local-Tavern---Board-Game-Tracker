import { motion, useReducedMotion } from 'framer-motion';
import { BookOpen, Check, Dices, Lock } from 'lucide-react';
import GameCover from '../GameCover';
import { formatLength, formatPlayers, formatShortDate } from '../../lib/format';
import { btnGhost, btnPrimary, btnSecondary } from '../ui';

/** The game locked in for tonight, with a one-tap "log this play". */
export default function TonightPick({ game, stats, logged, onLog, onChange }) {
  const reduceMotion = useReducedMotion();
  const playtime = formatLength(game);
  const count = stats?.count ?? 0;

  return (
    <motion.section
      aria-label="Tonight's pick"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.36, ease: [0.16, 1, 0.3, 1] } }}
      className="rounded-md border border-accent bg-surface p-4 sm:p-5"
    >
      <div className="flex gap-4 sm:gap-5">
        <GameCover
          title={game.title}
          color={game.color}
          className="aspect-[3/4] w-24 shrink-0 self-start sm:w-32"
          monogramClassName="text-4xl sm:text-5xl"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-3xl leading-tight font-bold text-ink">{game.title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-accent">
            <Lock aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
            Locked in for tonight
          </p>
          <p className="tabular mt-2 text-sm text-muted">
            {formatPlayers(game.minPlayers, game.maxPlayers)}
            {playtime && ` · ${playtime}`}
          </p>
          <p className="tabular mt-0.5 text-sm text-muted">
            {count === 0 ? (
              'First time at this table'
            ) : (
              <>
                Played {count}&times; · last <time dateTime={stats.last}>{formatShortDate(stats.last)}</time>
              </>
            )}
          </p>
          {game.tags.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1" aria-label="Tags">
              {game.tags.map((tag) => (
                <li key={tag} className="rounded-sm bg-raised px-1.5 py-0.5 text-xs font-medium text-muted">
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4">
        {logged ? (
          <>
            <p className="mr-auto flex items-center gap-1.5 text-sm font-semibold text-ok">
              <Check aria-hidden="true" className="size-4" strokeWidth={3} />
              Logged in the ledger
            </p>
            <a href="#ledger" className={`${btnSecondary} no-underline`}>
              <BookOpen aria-hidden="true" className="size-4" />
              Open ledger
            </a>
          </>
        ) : (
          <button type="button" onClick={() => onLog(game)} className={btnPrimary}>
            <BookOpen aria-hidden="true" className="size-4" />
            Log this play
          </button>
        )}
        <button type="button" onClick={onChange} className={btnGhost}>
          <Dices aria-hidden="true" className="size-4" />
          Change pick
        </button>
      </div>
    </motion.section>
  );
}
