import { useId, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Cover from '../covers/Cover';
import { agoLabel, logStats } from '../../lib/log';
import { formatShortDate } from '../../lib/format';

const numberFormat = new Intl.NumberFormat();

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
              <span className="tabular w-20 shrink-0 text-right text-sm text-muted">
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

/** Log stats for the kinds in view: headline figures, by kind, most used, win leaderboard, gathering dust. */
export default function LogStats({ activity, items, kinds }) {
  const stats = useMemo(() => logStats(activity, items, { kinds }), [activity, items, kinds]);
  const boardOnly = stats.kinds.length === 1 && stats.kinds[0] === 'board';
  const mostTitle = stats.kinds.every((k) => k === 'board' || k === 'video') ? 'Most played' : 'Most returned to';

  return (
    <div className="space-y-5 rounded-md border border-line bg-surface p-4 sm:p-5">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
        {stats.figures.map((f) => (
          <Figure key={f.id} label={f.label} value={numberFormat.format(f.value)} detail={f.detail} />
        ))}
      </dl>

      {stats.byKind.length > 1 && (
        <Block title={`${stats.year} by kind`} caption="Log entries this year">
          <BarList
            max={stats.byKind[0].count}
            rows={stats.byKind.map(({ kind, count }) => {
              const Icon = kind.icon;
              return {
                key: kind.id,
                lead: <Icon aria-hidden="true" className="size-4 shrink-0 text-muted" />,
                label: kind.plural,
                value: count,
                unit: count === 1 ? 'entry' : 'entries',
                title: `${kind.plural}: ${count} ${count === 1 ? 'entry' : 'entries'}`,
              };
            })}
          />
        </Block>
      )}

      {stats.mostUsed.length > 0 && (
        <Block title={mostTitle} caption={boardOnly ? null : 'Sessions and finishes'}>
          <BarList
            max={stats.mostUsed[0].count}
            rows={stats.mostUsed.map(({ item, count }) => ({
              key: item.id,
              label: item.title,
              value: count,
              unit: count === 1 ? 'time' : 'times',
              title: `${item.title}: ${count} ${count === 1 ? 'time' : 'times'}`,
            }))}
          />
        </Block>
      )}

      {stats.winners && (
        <Block title="Win leaderboard" caption={stats.winners.length ? 'Board game wins out of games played' : null}>
          {stats.winners.length === 0 ? (
            <p className="mt-1 text-sm text-muted">Mark who won when you log a board game and the crown race starts here.</p>
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
      )}

      {stats.dusty.length > 0 && (
        <Block title="Gathering dust" caption="Not started or in progress, longest untouched first">
          <ul className="mt-3 space-y-2.5">
            {stats.dusty.map(({ item, last, days }) => (
              <li key={item.id} className="flex items-center gap-3">
                <Cover item={item} className="w-7 shrink-0" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{item.title}</span>
                <span className="tabular shrink-0 text-xs text-muted">
                  {last ? (
                    <time dateTime={last} title={formatShortDate(last)}>
                      {agoLabel(days)}
                    </time>
                  ) : (
                    'never logged'
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
