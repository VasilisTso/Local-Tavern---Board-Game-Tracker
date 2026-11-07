import { useMemo } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Pencil, Trash2, Trophy } from 'lucide-react';
import GameCover from '../GameCover';
import { groupByMonth } from '../../lib/ledger';
import { parseLocal } from '../../lib/format';
import { iconBtn, iconBtnDanger } from '../ui';

const listFormat = (names) =>
  typeof Intl.ListFormat === 'function'
    ? new Intl.ListFormat(undefined, { style: 'long', type: 'conjunction' }).format(names)
    : names.join(', ');

function PlayDate({ date }) {
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

function PlayRow({ play, game, onEdit, onRemove }) {
  const title = game?.title ?? 'A game no longer on the shelf';
  const time = parseLocal(play.date)?.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return (
    <article className="flex gap-3 py-3 sm:gap-4">
      <PlayDate date={play.date} />
      {game ? (
        <GameCover title={game.title} className="aspect-[3/4] w-10 shrink-0 self-start" monogramClassName="text-base" />
      ) : (
        <div aria-hidden="true" className="aspect-[3/4] w-10 shrink-0 self-start rounded-sm border border-dashed border-line-strong" />
      )}

      <div className="min-w-0 flex-1">
        <h4 className={`font-display text-lg leading-tight font-bold ${game ? 'text-ink' : 'text-muted italic'}`}>
          {title}
        </h4>
        <p className="mt-0.5 text-sm text-muted">
          {time && <span className="tabular">{time}</span>}
          {play.players.length > 0 && (
            <>
              {time && ' · '}
              with {listFormat(play.players)}
            </>
          )}
        </p>
        {play.winners.length > 0 && (
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-ink">
            <Trophy aria-hidden="true" className="size-3.5 shrink-0 text-accent" />
            {listFormat(play.winners)} won
          </p>
        )}
        {play.note && <p className="mt-1 max-w-prose text-sm text-muted italic">“{play.note}”</p>}
      </div>

      <div className="-mt-1 -mr-1 flex shrink-0 flex-col sm:flex-row">
        <button type="button" onClick={() => onEdit(play)} aria-label={`Edit ${title} play`} className={iconBtn}>
          <Pencil aria-hidden="true" className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => onRemove(play, title)}
          aria-label={`Delete ${title} play from the ledger`}
          className={iconBtnDanger}
        >
          <Trash2 aria-hidden="true" className="size-4" />
        </button>
      </div>
    </article>
  );
}

/** The play log, newest first, one section per month. */
export default function PlayList({ plays, games, onEdit, onRemove }) {
  const reduceMotion = useReducedMotion();
  const gameById = useMemo(() => new Map(games.map((g) => [g.id, g])), [games]);
  const months = useMemo(() => groupByMonth(plays), [plays]);

  const rowMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, height: 0 },
        animate: { opacity: 1, height: 'auto', transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] } },
        exit: { opacity: 0, height: 0, transition: { duration: 0.16 } },
      };

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
              {month.plays.length} {month.plays.length === 1 ? 'play' : 'plays'}
            </span>
          </h3>
          <ul className="divide-y divide-line">
            <AnimatePresence initial={false}>
              {month.plays.map((play) => (
                <motion.li key={play.id} {...rowMotion} className="overflow-hidden">
                  <PlayRow play={play} game={gameById.get(play.gameId)} onEdit={onEdit} onRemove={onRemove} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </section>
      ))}
    </div>
  );
}
