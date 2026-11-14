import { useId, useState } from 'react';
import { ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { ChipGroup, KindChips, TagPicker } from '../Chips';
import { KINDS } from '../../lib/kinds';
import { countLabel } from '../../lib/format';
import { MINUTES_PER_PAGE, PICK_STATUSES, TIME_BUDGETS, clearPickFilters, pickFilterCount } from '../../lib/wheel';
import { field } from '../ui';

/** One line naming what the filters let onto the wheel, e.g. "Not started · Books, Films · Any length". */
function summarize(pick, locations, night) {
  const label = (list, id) => list.find((o) => o.id === id)?.label;
  const kinds = pick.kinds.length
    ? KINDS.filter((k) => pick.kinds.includes(k.id))
        .map((k) => k.plural)
        .join(', ')
    : 'Every kind';
  const place = pick.location === 'any' ? 'Every place' : (locations.find((l) => l.id === pick.location)?.name ?? 'Every place');
  return [
    night && label(night.sources, night.source),
    label(PICK_STATUSES, pick.status),
    kinds,
    label(TIME_BUDGETS, pick.budget),
    place,
    pick.tags.length > 0 && countLabel(pick.tags.length, 'tag'),
  ]
    .filter(Boolean)
    .join(' · ');
}

/**
 * What goes on the wheel, folded to a one-line summary: kinds, status, time budget, place, tags,
 * the neglect weighting and, in game night mode, the player count.
 */
export default function PickFilters({ pick, onChange, locations, tags, night }) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const set = (key) => (value) => onChange({ ...pick, [key]: value });
  const count = pickFilterCount(pick);

  return (
    <section aria-labelledby={`${uid}-heading`} className="rounded-md border border-line bg-surface">
      <div className="flex items-center gap-2 py-1.5 pr-2 pl-4">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${uid}-panel`}
          onClick={() => setOpen((o) => !o)}
          className="group flex min-h-11 min-w-0 flex-1 items-center gap-3 text-left"
        >
          <SlidersHorizontal aria-hidden="true" className="size-4 shrink-0 text-muted group-hover:text-ink" />
          <span className="min-w-0 flex-1">
            <span id={`${uid}-heading`} className="block text-sm font-semibold text-ink">
              What goes on the wheel
            </span>
            <span className="block truncate text-sm text-muted">{summarize(pick, locations, night)}</span>
          </span>
          <ChevronDown aria-hidden="true" className={`size-4 shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {count > 0 && (
          <button
            type="button"
            onClick={() => onChange(clearPickFilters(pick))}
            className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-accent hover:bg-raised"
          >
            <RotateCcw aria-hidden="true" className="size-3.5" />
            Reset
          </button>
        )}
      </div>

      <div id={`${uid}-panel`} hidden={!open} className="space-y-4 border-t border-line p-4 sm:p-5">
        {night && (
          <ChipGroup legend="Player count" name={`${uid}-seats`} options={night.sources} value={night.source} onChange={night.onSource} />
        )}

        <KindChips value={pick.kinds} onChange={set('kinds')} legend="Kinds (none means all)" visibleLegend />

        <ChipGroup legend="Status" name={`${uid}-status`} options={PICK_STATUSES} value={pick.status} onChange={set('status')} />

        <ChipGroup legend="Time you have" name={`${uid}-budget`} options={TIME_BUDGETS} value={pick.budget} onChange={set('budget')} />
        {pick.budget !== 'any' && (
          <p className="-mt-2 text-xs text-muted">
            Books count about {MINUTES_PER_PAGE} minutes a page. Items without a length always fit.
          </p>
        )}

        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1 basis-44">
            <label htmlFor={`${uid}-place`} className="mb-1.5 block text-xs font-semibold text-muted">
              Place
            </label>
            <select id={`${uid}-place`} value={pick.location} onChange={(e) => set('location')(e.target.value)} className={field}>
              <option value="any">Every place</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          {tags.length > 0 && (
            <TagPicker tags={tags} selected={pick.tags} onChange={set('tags')} legend="Only items with any of these tags" />
          )}
        </div>

        <label className="flex min-h-10 items-center gap-2.5 border-t border-line pt-3 text-sm text-ink">
          <input
            type="checkbox"
            checked={pick.favorNeglected}
            onChange={(e) => set('favorNeglected')(e.target.checked)}
            className="size-4"
          />
          Favor what's gathering dust
          <span className="text-muted">(bigger slice)</span>
        </label>
      </div>
    </section>
  );
}
