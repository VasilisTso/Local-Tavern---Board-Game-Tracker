import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, LayoutGrid, Library, List, MapPin, Plus, Search, SlidersHorizontal, Tags, X } from 'lucide-react';
import { KINDS, kindHasField } from '../../lib/kinds';
import { LENGTH_BUCKETS, PLAYER_OPTIONS, SORTS, STATUS_OPTIONS, VIEWS, moreFiltersCount } from '../../lib/shelf';
import { btnPrimary, btnSecondary, chip, field } from '../ui';

const VIEW_ICONS = { shelf: Library, grid: LayoutGrid, list: List };

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

/** Kind chips: several can be on; none on means every kind. */
function KindChips({ value, onChange }) {
  const toggle = (id) => onChange(value.includes(id) ? value.filter((k) => k !== id) : [...value, id]);
  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">Show kinds</legend>
      <div className="-mx-4 -my-1 flex gap-1.5 overflow-x-auto px-4 py-1 [scrollbar-width:none] sm:m-0 sm:flex-wrap sm:overflow-visible sm:p-0">
        {KINDS.map((kind) => {
          const Icon = kind.icon;
          return (
            <label key={kind.id} className="relative shrink-0">
              <input
                type="checkbox"
                checked={value.includes(kind.id)}
                onChange={() => toggle(kind.id)}
                className="peer sr-only"
              />
              <span className={chip}>
                <Icon aria-hidden="true" className="size-4" />
                {kind.plural}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function ViewSwitch({ value, onChange }) {
  return (
    <fieldset className="flex shrink-0 rounded-md border border-line p-0.5">
      <legend className="sr-only">View</legend>
      {VIEWS.map((view) => {
        const Icon = VIEW_ICONS[view.id];
        return (
          <label key={view.id} title={view.label} className="relative">
            <input
              type="radio"
              name="library-view"
              value={view.id}
              checked={value === view.id}
              onChange={() => onChange(view.id)}
              className="peer sr-only"
            />
            <span className="inline-flex h-9 items-center gap-1.5 rounded-[5px] px-2.5 text-sm font-semibold text-muted transition-colors duration-150 hover:text-ink peer-checked:bg-raised peer-checked:text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-accent">
              <Icon aria-hidden="true" className="size-4" />
              <span className="max-lg:sr-only">{view.label}</span>
            </span>
          </label>
        );
      })}
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

  const toggle = (tag) => onChange(selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag]);

  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-xs font-semibold text-muted" aria-hidden="true">
        Tags
      </p>
      <details ref={ref} className="group relative" onKeyDown={onKeyDown}>
        <summary
          className={`${chip} list-none [&::-webkit-details-marker]:hidden ${selected.length ? 'border-accent bg-raised text-ink' : ''}`}
          aria-label={`Tags${selected.length ? `, ${selected.length} selected` : ''}`}
        >
          <Tags aria-hidden="true" className="size-4" />
          {selected.length ? `${selected.length} selected` : 'Any tag'}
          <ChevronDown aria-hidden="true" className="size-4 transition-transform group-open:rotate-180" />
        </summary>
        <div className="absolute left-0 z-20 mt-1.5 w-64 max-w-[calc(100vw-2rem)] rounded-md border border-line-strong bg-surface p-1.5 shadow-[0_12px_32px_-12px_oklch(0.1_0.02_55/0.55)]">
          <fieldset>
            <legend className="sr-only">Show items with any of these tags</legend>
            <div className="max-h-72 overflow-y-auto overscroll-contain">
              {tags.map(({ tag, count }) => (
                <label key={tag} className="flex min-h-10 items-center gap-2.5 rounded-sm px-2 text-sm text-ink hover:bg-raised">
                  <input type="checkbox" checked={selected.includes(tag)} onChange={() => toggle(tag)} className="size-4 shrink-0" />
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

/**
 * Library controls: search, kind chips, view switch, places and "Add item" up front; place,
 * status, length, players, tags and sort behind "Filters".
 */
export default function LibraryToolbar({ filters, onChange, view, onViewChange, locations, tags, onAdd, onPlaces }) {
  const searchId = useId();
  const sortId = useId();
  const placeId = useId();
  const panelId = useId();
  const extra = moreFiltersCount(filters);
  const [open, setOpen] = useState(extra > 0);
  const set = (key) => (value) => onChange({ ...filters, [key]: value });

  // Player counts only mean something for board and video games.
  const showPlayers = !filters.kinds.length || filters.kinds.some((k) => kindHasField(k, 'players'));
  const playerOptions = PLAYER_OPTIONS.map((id) => ({ id, label: id === 'any' ? 'Any' : id }));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 basis-full sm:basis-auto sm:flex-1">
          <label htmlFor={searchId} className="sr-only">
            Search the library
          </label>
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <input
            id={searchId}
            type="search"
            value={filters.query}
            onChange={(e) => set('query')(e.target.value)}
            placeholder="Search titles, creators, tags"
            autoComplete="off"
            className={`${field} pr-10 pl-9 [&::-webkit-search-cancel-button]:hidden`}
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
        <ViewSwitch value={view} onChange={onViewChange} />
        <button type="button" onClick={onPlaces} className={`${btnSecondary} max-sm:px-3`}>
          <MapPin aria-hidden="true" className="size-4" />
          <span className="max-sm:sr-only">Places</span>
        </button>
        <button type="button" onClick={onAdd} className={`${btnPrimary} max-sm:ml-auto max-sm:px-3`}>
          <Plus aria-hidden="true" className="size-4" strokeWidth={2.5} />
          Add item
        </button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <KindChips value={filters.kinds} onChange={set('kinds')} />
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className={`${chip} self-start ${open || extra ? 'text-ink' : ''}`}
        >
          <SlidersHorizontal aria-hidden="true" className="size-4" />
          Filters
          {extra > 0 && (
            <span className="tabular rounded-sm bg-accent-fill px-1.5 text-xs font-bold text-on-accent">
              {extra}
              <span className="sr-only"> on</span>
            </span>
          )}
          <ChevronDown aria-hidden="true" className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div id={panelId} hidden={!open} className="space-y-4 rounded-md border border-line bg-surface p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-x-6">
          <div className="sm:w-56">
            <label htmlFor={placeId} className="mb-1.5 block text-xs font-semibold text-muted">
              Place
            </label>
            <select id={placeId} value={filters.location} onChange={(e) => set('location')(e.target.value)} className={`${field} pr-8`}>
              <option value="any">Every place</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
              <option value="none">No place yet</option>
            </select>
          </div>
          <div className="sm:w-56">
            <label htmlFor={sortId} className="mb-1.5 block text-xs font-semibold text-muted">
              Sort
            </label>
            <select id={sortId} value={filters.sort} onChange={(e) => set('sort')(e.target.value)} className={`${field} pr-8`}>
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          {tags.length > 0 && <TagPicker tags={tags} selected={filters.tags} onChange={set('tags')} />}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-x-6">
          <ChipGroup legend="Status" name="library-status" options={STATUS_OPTIONS} value={filters.status} onChange={set('status')} />
          <ChipGroup legend="Length" name="library-length" options={LENGTH_BUCKETS} value={filters.length} onChange={set('length')} />
          {showPlayers && (
            <ChipGroup legend="Players" name="library-players" options={playerOptions} value={filters.players} onChange={set('players')} />
          )}
        </div>
      </div>
    </div>
  );
}
