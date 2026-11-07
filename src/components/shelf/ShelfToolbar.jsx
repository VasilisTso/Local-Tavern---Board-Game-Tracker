import { useEffect, useId, useRef } from 'react';
import { ChevronDown, Search, Tags, X } from 'lucide-react';
import { PLAYER_OPTIONS, SORTS, TIME_BUCKETS } from '../../lib/shelf';
import { chip, field } from '../ui';

function ChipGroup({ legend, name, options, value, onChange }) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 text-xs font-semibold text-muted">{legend}</legend>
      <div className="-mx-4 -my-1 flex gap-1.5 overflow-x-auto px-4 py-1 [scrollbar-width:none] sm:m-0 sm:flex-wrap sm:overflow-visible sm:p-0">
        {options.map((option) => (
          <label key={option.id} title={option.title} className="relative shrink-0">
            <input
              type="radio"
              name={name}
              value={option.id}
              checked={value === option.id}
              onChange={() => onChange(option.id)}
              className="peer sr-only"
            />
            <span className={chip}>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function TagPicker({ tags, selected, onChange }) {
  const ref = useRef(null);

  // <details> stays open on outside clicks; close it like a menu.
  useEffect(() => {
    const onPointerDown = (event) => {
      if (ref.current?.open && !ref.current.contains(event.target)) ref.current.open = false;
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const onKeyDown = (event) => {
    if (event.key === 'Escape' && ref.current?.open) {
      event.stopPropagation();
      ref.current.open = false;
      ref.current.querySelector('summary')?.focus();
    }
  };

  const toggle = (tag) =>
    onChange(selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag]);

  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-xs font-semibold text-muted" aria-hidden="true">
        Tags
      </p>
      <details ref={ref} className="group relative" onKeyDown={onKeyDown}>
        <summary
          className={`${chip} list-none [&::-webkit-details-marker]:hidden ${
            selected.length ? 'border-accent text-ink bg-raised' : ''
          }`}
          aria-label={`Tags${selected.length ? `, ${selected.length} selected` : ''}`}
        >
          <Tags aria-hidden="true" className="size-4" />
          {selected.length ? `${selected.length} selected` : 'Any tag'}
          <ChevronDown aria-hidden="true" className="size-4 transition-transform group-open:rotate-180" />
        </summary>
        <div className="absolute left-0 z-20 mt-1.5 w-64 max-w-[calc(100vw-2rem)] rounded-md border border-line-strong bg-surface p-1.5 shadow-[0_12px_32px_-12px_oklch(0.1_0.02_55/0.55)]">
          <fieldset>
            <legend className="sr-only">Show games with any of these tags</legend>
            <div className="max-h-72 overflow-y-auto overscroll-contain">
              {tags.map(({ tag, count }) => (
                <label
                  key={tag}
                  className="flex min-h-10 items-center gap-2.5 rounded-sm px-2 text-sm text-ink hover:bg-raised"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(tag)}
                    onChange={() => toggle(tag)}
                    className="size-4 shrink-0"
                  />
                  <span className="min-w-0 flex-1 truncate">{tag}</span>
                  <span className="tabular text-xs text-muted">{count}</span>
                </label>
              ))}
            </div>
          </fieldset>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="mt-1 flex h-9 w-full items-center justify-center rounded-sm border-t border-line text-sm font-semibold text-accent hover:bg-raised"
            >
              Clear tags
            </button>
          )}
        </div>
      </details>
    </div>
  );
}

export default function ShelfToolbar({ filters, onChange, tonightCount, tags }) {
  const searchId = useId();
  const sortId = useId();
  const set = (key) => (value) => onChange({ ...filters, [key]: value });

  const playerOptions = PLAYER_OPTIONS.map((id) =>
    id === 'any'
      ? { id, label: 'Any' }
      : id === 'tonight'
        ? {
            id,
            label: `Tonight · ${tonightCount}`,
            title: `Fits tonight's table: you plus ${tonightCount - 1} going`,
          }
        : { id, label: id },
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <label htmlFor={searchId} className="sr-only">
            Search the shelf
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
          />
          <input
            id={searchId}
            type="search"
            value={filters.query}
            onChange={(e) => set('query')(e.target.value)}
            placeholder="Search titles and tags"
            autoComplete="off"
            className={`${field} pl-9 pr-10 [&::-webkit-search-cancel-button]:hidden`}
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => set('query')('')}
              aria-label="Clear search"
              className="absolute top-1/2 right-0.5 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:text-ink"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 sm:w-60">
          <label htmlFor={sortId} className="shrink-0 text-sm font-semibold text-muted">
            Sort
          </label>
          <select
            id={sortId}
            value={filters.sort}
            onChange={(e) => set('sort')(e.target.value)}
            className={`${field} pr-8`}
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-x-6">
        <ChipGroup
          legend="Players"
          name="shelf-players"
          options={playerOptions}
          value={filters.players}
          onChange={set('players')}
        />
        <ChipGroup
          legend="Playtime"
          name="shelf-time"
          options={TIME_BUCKETS}
          value={filters.time}
          onChange={set('time')}
        />
        {tags.length > 0 && <TagPicker tags={tags} selected={filters.tags} onChange={set('tags')} />}
      </div>
    </div>
  );
}
