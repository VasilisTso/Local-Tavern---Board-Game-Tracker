import { useId, useState } from 'react';
import { ChevronDown, LayoutGrid, Library, List, MapPin, Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import { ChipGroup, KindChips, TagPicker } from '../Chips';
import { kindHasField } from '../../lib/kinds';
import { LENGTH_BUCKETS, PLAYER_OPTIONS, SORTS, STATUS_OPTIONS, VIEWS, moreFiltersCount } from '../../lib/shelf';
import { btnPrimary, btnSecondary, chip, field } from '../ui';

const VIEW_ICONS = { shelf: Library, grid: LayoutGrid, list: List };

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
  const playerOptions = PLAYER_OPTIONS.map((id) => ({
    id,
    label: id === 'any' ? 'Any' : id,
  }));

  // Phones fold the kind chips into the panel, so its count includes them there.
  const toggle = (count, className) => (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={panelId}
      onClick={() => setOpen((o) => !o)}
      className={`${chip} ${className} ${open || count ? 'text-ink' : ''}`}
    >
      <SlidersHorizontal aria-hidden="true" className="size-4" />
      Filters
      {count > 0 && (
        <span className="tabular rounded-sm bg-accent-fill px-1.5 text-xs font-bold text-on-accent">
          {count}
          <span className="sr-only"> on</span>
        </span>
      )}
      <ChevronDown aria-hidden="true" className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
  );

  return (
    <div className="space-y-3">
      {/* Phones: search and Add on one row, view, places and Filters on the next. */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative max-sm:order-1 min-w-0 flex-1">
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
        <span aria-hidden="true" className="order-3 basis-full sm:hidden" />
        <div className="max-sm:order-4">
          <ViewSwitch value={view} onChange={onViewChange} />
        </div>
        <button type="button" onClick={onPlaces} className={`${btnSecondary} max-sm:order-5 max-[22.5rem]:px-3`}>
          <MapPin aria-hidden="true" className="size-4" />
          <span className="max-[22.5rem]:sr-only">Places</span>
        </button>
        <button type="button" onClick={onAdd} className={`${btnPrimary} max-sm:order-2 max-sm:px-3`}>
          <Plus aria-hidden="true" className="size-4" strokeWidth={2.5} />
          <span>
            Add<span className="max-sm:sr-only"> item</span>
          </span>
        </button>
        {toggle(extra + (filters.kinds.length > 0), 'order-6 ml-auto sm:hidden')}
      </div>

      <div className="flex items-start justify-between gap-2 max-sm:hidden">
        <KindChips value={filters.kinds} onChange={set('kinds')} />
        {toggle(extra, 'shrink-0')}
      </div>

      <div id={panelId} hidden={!open} className="space-y-4 rounded-md border border-line bg-surface p-4">
        <div className="sm:hidden">
          <KindChips value={filters.kinds} onChange={set('kinds')} legend="Kinds" visibleLegend />
        </div>
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
