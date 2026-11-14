import { motion, useReducedMotion } from 'framer-motion';
import { BookOpen, Check, Dices, Lock } from 'lucide-react';
import Cover from '../covers/Cover';
import { formatLength, formatPlayers, formatShortDate } from '../../lib/format';
import { kindLine } from '../../lib/shelf';
import { riseIn } from '../../lib/motion';
import { btnGhost, btnPrimary, btnSecondary } from '../ui';

/** Game night: the item locked in for tonight, with a one-tap "log this session". */
export default function LockedPick({ item, stats, logged, onLog, onChange }) {
  const reduceMotion = useReducedMotion();
  const count = stats?.count ?? 0;
  const meta = [kindLine(item), formatPlayers(item.minPlayers, item.maxPlayers), formatLength(item)].filter(Boolean);

  return (
    <motion.section
      aria-label="Tonight's pick"
      {...riseIn(reduceMotion)}
      className="rounded-md border border-accent bg-surface p-4 sm:p-5"
    >
      <div className="flex gap-4 sm:gap-5">
        <div className="shrink-0 self-start" style={{ filter: 'var(--obj-pulled)' }}>
          <Cover item={item} className="w-24 sm:w-32" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-3xl leading-[1.05] font-extrabold break-words text-ink">{item.title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-accent">
            <Lock aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
            Locked in for tonight
          </p>
          <p className="tabular mt-2 text-sm text-muted">{meta.join(' · ')}</p>
          <p className="tabular mt-0.5 text-sm text-muted">
            {count === 0 ? (
              'First time at this table'
            ) : (
              <>
                Played {count}&times; · last <time dateTime={stats.last}>{formatShortDate(stats.last)}</time>
              </>
            )}
          </p>
          {item.tags.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1" aria-label="Tags">
              {item.tags.map((tag) => (
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
              Logged
            </p>
            <a href="#log" className={`${btnSecondary} no-underline`}>
              <BookOpen aria-hidden="true" className="size-4" />
              Open the log
            </a>
          </>
        ) : (
          <button type="button" onClick={() => onLog(item)} className={btnPrimary}>
            <BookOpen aria-hidden="true" className="size-4" />
            Log this session
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
