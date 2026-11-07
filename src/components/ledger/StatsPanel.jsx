import { useId, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import GameCover from '../GameCover';
import { agoLabel, ledgerStats } from '../../lib/ledger';
import { formatPlaytime, formatShortDate } from '../../lib/format';

/** One headline number. Display face per the direction contract; proportional figures at size. */
function Figure({ label, value, detail }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold text-muted">{label}</dt>
      <dd className="mt-0.5 font-display text-3xl leading-none font-bold text-ink">{value}</dd>
      {detail && <dd className="mt-1 text-xs text-muted">{detail}</dd>}
    </div>
  );
}

/**
 * Single-series horizontal bars: label above, bar from a shared baseline, value at the tip.
 * Each row is plain text too (label + value), so the list doubles as the table view.
 */
function BarList({ rows, max }) {
  const reduceMotion = useReducedMotion();
  return (
    <ol className="mt-3 space-y-3">
      {rows.map((row, i) => {
        const pct = max > 0 ? Math.max((row.value / max) * 100, 2) : 0;
        return (
          <li key={row.key} title={row.title}>
            <div className="flex items-center gap-2 text-sm">
              {row.lead}
              <span className="min-w-0 flex-1 truncate font-medium text-ink">{row.label}</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-3 min-w-0 flex-1">
                <motion.div
                  className="h-full rounded-r-[4px] bg-accent"
                  initial={reduceMotion ? false : { width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}
                />
              </div>
              <span className="tabular w-16 shrink-0 text-right text-sm text-muted">
                <span className="font-semibold text-ink">{row.value}</span> {row.unit}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Block({ title, caption, children }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="border-t border-line pt-4">
      <h3 id={id} className="font-display text-lg font-bold">
        {title}
      </h3>
      {caption && <p className="text-xs text-muted">{caption}</p>}
      {children}
    </section>
  );
}

/** Ledger stats: headline figures, most played, win leaderboard, gathering dust. */
export default function StatsPanel({ plays, games }) {
  const stats = useMemo(() => ledgerStats(plays, games), [plays, games]);
  const playtime = formatPlaytime(stats.avgPlaytime);

  return (
    <div className="space-y-5 rounded-md border border-line bg-surface p-4 sm:p-5">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
        <Figure label="Game nights" value={stats.nights} />
        <Figure label="Plays logged" value={stats.plays} />
        <Figure
          label="Games played"
          value={stats.gamesPlayed}
          detail={games.length ? `of ${games.length} on the shelf` : null}
        />
        <Figure label="Average game" value={playtime ?? '—'} detail={playtime ? 'by listed playtime' : 'no playtimes listed'} />
      </dl>

      {stats.mostPlayed.length > 0 && (
        <Block title="Most played">
          <BarList
            max={stats.mostPlayed[0].count}
            rows={stats.mostPlayed.map(({ game, count }) => ({
              key: game.id,
              label: game.title,
              value: count,
              unit: count === 1 ? 'play' : 'plays',
              title: `${game.title}: ${count} ${count === 1 ? 'play' : 'plays'}`,
            }))}
          />
        </Block>
      )}

      <Block title="Win leaderboard" caption={stats.winners.length ? 'Wins out of games played' : null}>
        {stats.winners.length === 0 ? (
          <p className="mt-1 text-sm text-muted">Mark who won when you log a play and the crown race starts here.</p>
        ) : (
          <BarList
            max={stats.winners[0].wins}
            rows={stats.winners.map((p, i) => ({
              key: p.name,
              lead: (
                <span className="tabular w-4 shrink-0 text-right text-xs font-semibold text-muted" aria-hidden="true">
                  {i + 1}
                </span>
              ),
              label: (
                <>
                  {p.name} <span className="tabular font-normal text-muted">· of {p.played}</span>
                </>
              ),
              value: p.wins,
              unit: p.wins === 1 ? 'win' : 'wins',
              title: `${p.name}: ${p.wins} ${p.wins === 1 ? 'win' : 'wins'} in ${p.played} ${p.played === 1 ? 'game' : 'games'}`,
            }))}
          />
        )}
      </Block>

      {stats.dusty.length > 0 && (
        <Block title="Gathering dust" caption="Longest since it left the shelf">
          <ul className="mt-3 space-y-2.5">
            {stats.dusty.map(({ game, last, days }) => (
              <li key={game.id} className="flex items-center gap-3">
                <GameCover title={game.title} color={game.color} className="aspect-[3/4] w-7 shrink-0" monogramClassName="text-[0.6rem]" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{game.title}</span>
                <span className="tabular shrink-0 text-xs text-muted">
                  {last ? (
                    <time dateTime={last} title={formatShortDate(last)}>
                      {agoLabel(days)}
                    </time>
                  ) : (
                    'never played'
                  )}
                </span>
              </li>
            ))}
          </ul>
        </Block>
      )}
    </div>
  );
}
