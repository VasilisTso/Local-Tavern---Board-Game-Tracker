import { Clock, Pencil, Trash2, Users } from 'lucide-react';
import Cover from '../covers/Cover';
import { formatLength, formatPlayers, formatShortDate } from '../../lib/format';
import { iconBtn, iconBtnDanger } from '../ui';

export default function GameCard({ game, stats, isTonightPick, onEdit, onRemove }) {
  const playtime = formatLength(game);
  const count = stats?.count ?? 0;

  return (
    <article className="flex h-full gap-3.5 rounded-md border border-line bg-surface p-3 transition-colors duration-150 hover:border-line-strong">
      <Cover item={game} className="w-16 shrink-0 self-start sm:w-[4.5rem]" />

      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="font-display text-lg font-bold leading-tight text-ink">{game.title}</h3>

        <p className="tabular mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-muted">
          <span className="inline-flex items-center gap-1">
            <Users aria-hidden="true" className="size-3.5" />
            {formatPlayers(game.minPlayers, game.maxPlayers)}
          </span>
          {playtime && (
            <span className="inline-flex items-center gap-1">
              <Clock aria-hidden="true" className="size-3.5" />
              {playtime}
            </span>
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

        <p className="tabular mt-auto pt-2 text-xs text-muted">
          {isTonightPick && <span className="mr-2 font-semibold text-accent">Tonight&rsquo;s pick</span>}
          {count === 0 ? (
            'Not played yet'
          ) : (
            <>
              Played {count}&times; · last <time dateTime={stats.last}>{formatShortDate(stats.last)}</time>
            </>
          )}
        </p>
      </div>

      <div className="-mt-1 -mr-1 flex shrink-0 flex-col">
        <button type="button" onClick={() => onEdit(game)} aria-label={`Edit ${game.title}`} className={iconBtn}>
          <Pencil aria-hidden="true" className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => onRemove(game)}
          aria-label={`Remove ${game.title} from the shelf`}
          className={iconBtnDanger}
        >
          <Trash2 aria-hidden="true" className="size-4" />
        </button>
      </div>
    </article>
  );
}
