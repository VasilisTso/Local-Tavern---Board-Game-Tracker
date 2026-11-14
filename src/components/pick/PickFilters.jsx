import { useId } from 'react';
import { RotateCcw } from 'lucide-react';
import { ChipGroup, KindChips, TagPicker } from '../Chips';
import { MINUTES_PER_PAGE, PICK_STATUSES, TIME_BUDGETS, clearPickFilters, pickFilterCount } from '../../lib/wheel';
import { field } from '../ui';

/**
 * What goes on the wheel: kinds, status, time budget, place, tags, the neglect weighting and,
 * in game night mode, the player count.
 */
export default function PickFilters({ pick, onChange, locations, tags, night }) {
  const uid = useId();
  const set = (key) => (value) => onChange({ ...pick, [key]: value });
  const count = pickFilterCount(pick);

  return (
    <section aria-labelledby={`${uid}-heading`} className="space-y-4 rounded-md border border-line bg-surface p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 id={`${uid}-heading`} className="font-display text-xl font-bold">
          What goes on the wheel
        </h3>
        {count > 0 && (
          <button
            type="button"
            onClick={() => onChange(clearPickFilters(pick))}
            className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-accent underline-offset-4 hover:underline"
          >
            <RotateCcw aria-hidden="true" className="size-3.5" />
            Reset
          </button>
        )}
      </div>

      {night && (
        <ChipGroup
          legend="Player count"
          name={`${uid}-seats`}
          options={night.sources}
          value={night.source}
          onChange={night.onSource}
        />
      )}

      <div>
        <p className="mb-1.5 text-xs font-semibold text-muted" aria-hidden="true">
          Kinds
        </p>
        <KindChips value={pick.kinds} onChange={set('kinds')} legend="Kinds on the wheel (none means all)" />
      </div>

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
    </section>
  );
}
