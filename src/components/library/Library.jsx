import { useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import { Plus } from 'lucide-react';
import LibraryToolbar from './LibraryToolbar';
import NowStrip from './NowStrip';
import ShelfView from './ShelfView';
import GridView from './GridView';
import ListView from './ListView';
import ItemSheet from './ItemSheet';
import ItemDialog from './ItemDialog';
import LocationsDialog from './LocationsDialog';
import {
  DEFAULT_FILTERS,
  DEFAULT_VIEW,
  groupByLocation,
  isFiltered,
  matchesFilters,
  normalizeView,
  nowItems,
  sortItems,
  standsFaceOut,
  tagsByUse,
} from '../../lib/shelf';
import { playStatsByGame } from '../../lib/plays';
import { KEYS } from '../../lib/storage';
import { usePersistentState } from '../../hooks/usePersistentState';
import { btnPrimary, btnSecondary } from '../ui';
import './library.css';

const defaultView = () => DEFAULT_VIEW;

export default function Library({ itemsApi, locationsApi, activity, toast }) {
  const { items, addItem, updateItem, removeItem, restoreItem } = itemsApi;
  const { locations } = locationsApi;
  const [view, setView] = usePersistentState(KEYS.view, defaultView, normalizeView);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [dialog, setDialog] = useState({ open: false, item: null });
  const [placesOpen, setPlacesOpen] = useState(false);
  /** The item open in the detail sheet and the view it was opened from (for the shared layout). */
  const [open, setOpen] = useState(null);

  const useStats = useMemo(() => playStatsByGame(activity), [activity]);
  const tags = useMemo(() => tagsByUse(items), [items]);
  const locationIds = useMemo(() => new Set(locations.map((l) => l.id)), [locations]);
  const placeNames = useMemo(() => new Map(locations.map((l) => [l.id, l.name])), [locations]);
  const itemCounts = useMemo(() => {
    const counts = new Map();
    for (const item of items) counts.set(item.locationId, (counts.get(item.locationId) ?? 0) + 1);
    return counts;
  }, [items]);

  const filtered = isFiltered(filters);
  const visible = useMemo(
    () => sortItems(items.filter((i) => matchesFilters(i, filters, locationIds)), filters.sort, useStats),
    [items, filters, locationIds, useStats],
  );
  const groups = useMemo(
    () => groupByLocation(visible, locations, { keepEmpty: !filtered }),
    [visible, locations, filtered],
  );
  const now = useMemo(() => nowItems(items), [items]);

  const openItem = open ? items.find((i) => i.id === open.id) : null;
  const openIdFor = (origin) => (open?.origin === origin ? open.id : null);

  const clearFilters = () => setFilters((f) => ({ ...DEFAULT_FILTERS, sort: f.sort }));
  // Re-key the views on filter change so the entrance replays; edits animate in place.
  const filterKey = JSON.stringify({ ...filters, query: filters.query.trim(), sort: undefined });

  const openAdd = () => setDialog({ open: true, item: null });
  const openEdit = (item) => {
    setOpen(null);
    setDialog({ open: true, item });
  };
  const closeDialog = () => setDialog((d) => ({ ...d, open: false }));

  const save = (values) => {
    if (dialog.item) {
      updateItem(dialog.item.id, values);
      toast.show({ message: `Saved changes to ${values.title}.` });
    } else {
      const added = addItem(values);
      if (added && !matchesFilters(added, filters, locationIds)) {
        toast.show({ message: `Added ${added.title}. Your filters hide it.`, actionLabel: 'Show all', onAction: clearFilters });
      } else if (added) {
        toast.show({ message: `Added ${added.title} to the library.` });
      }
    }
    closeDialog();
  };

  const remove = (item) => {
    setOpen(null);
    const removed = removeItem(item.id);
    if (!removed) return;
    toast.show({ message: `Removed ${item.title}.`, actionLabel: 'Undo', onAction: () => restoreItem(removed) });
  };

  const closePlaces = (removed) => {
    setPlacesOpen(false);
    if (!removed.length) return;
    const names = removed.map((e) => e.item.name);
    toast.show({
      message: removed.length === 1 ? `Removed ${names[0]}.` : `Removed ${removed.length} places.`,
      actionLabel: 'Undo',
      // Oldest first, so each lands back at its old index.
      onAction: () => [...removed].reverse().forEach((entry) => locationsApi.restoreLocation(entry)),
    });
  };

  const defaults = { locationId: filters.location !== 'any' && filters.location !== 'none' ? filters.location : locations[0]?.id };

  return (
    <LayoutGroup>
      <div className="space-y-10">
        {!filtered && <NowStrip items={now} placeNames={placeNames} openId={openIdFor('now')} onOpen={(item, origin) => setOpen({ id: item.id, origin })} />}

        <div className="space-y-6">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Library{' '}
              <span className="tabular font-sans text-sm font-semibold tracking-normal text-muted">
                {items.length} {items.length === 1 ? 'item' : 'items'} · {locations.length} {locations.length === 1 ? 'place' : 'places'}
              </span>
            </h2>
          </div>

          <LibraryToolbar
            filters={filters}
            onChange={setFilters}
            view={view}
            onViewChange={setView}
            locations={locations}
            tags={tags}
            onAdd={openAdd}
            onPlaces={() => setPlacesOpen(true)}
          />

          {filtered && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-3 text-sm text-muted">
              <p className="tabular" aria-live="polite">
                Showing {visible.length} of {items.length}
              </p>
              <button type="button" onClick={clearFilters} className="font-semibold text-accent underline underline-offset-4 hover:no-underline">
                Clear filters
              </button>
            </div>
          )}

          {items.length === 0 ? (
            <div className="rounded-md border border-dashed border-line-strong px-6 py-12 text-center">
              <h3 className="font-display text-2xl font-bold">An empty shelf</h3>
              <p className="mx-auto mt-1 max-w-sm text-muted">
                Add the games, books, films and music you own or want. They show up here, in the picker and in the log.
              </p>
              <button type="button" onClick={openAdd} className={`${btnPrimary} mt-5`}>
                <Plus aria-hidden="true" className="size-4" strokeWidth={2.5} />
                Add your first item
              </button>
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-md border border-dashed border-line-strong px-6 py-10 text-center">
              <h3 className="font-display text-2xl font-bold">Nothing here fits</h3>
              <p className="mx-auto mt-1 max-w-sm text-muted">Loosen a filter or clear them all.</p>
              <button type="button" onClick={clearFilters} className={`${btnSecondary} mt-5`}>
                Clear filters
              </button>
            </div>
          ) : (
            <div key={`${view}:${filterKey}`}>
              {view === 'grid' ? (
                <GridView items={visible} placeNames={placeNames} openId={openIdFor('grid')} onOpen={(item, origin) => setOpen({ id: item.id, origin })} />
              ) : view === 'list' ? (
                <ListView
                  items={visible}
                  placeNames={placeNames}
                  openId={openIdFor('list')}
                  onOpen={(item, origin) => setOpen({ id: item.id, origin })}
                  onEdit={(item) => setDialog({ open: true, item })}
                  onRemove={remove}
                />
              ) : (
                <ShelfView groups={groups} openId={openIdFor('shelf')} onOpen={(item, origin) => setOpen({ id: item.id, origin })} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Before the dialogs: its exit hands focus and interactivity back before a dialog opens. */}
      <AnimatePresence>
        {openItem && (
          <ItemSheet
            key={openItem.id}
            item={openItem}
            origin={open.origin}
            fromSpine={open.origin === 'shelf' && !standsFaceOut(openItem)}
            placeName={placeNames.get(openItem.locationId)}
            stats={useStats.get(openItem.id)}
            onClose={() => setOpen(null)}
            onUpdate={(patch) => updateItem(openItem.id, patch)}
            onEdit={() => openEdit(openItem)}
            onRemove={() => remove(openItem)}
          />
        )}
      </AnimatePresence>

      <ItemDialog
        open={dialog.open}
        item={dialog.item}
        items={items}
        locations={locations}
        allTags={tags.map((t) => t.tag)}
        defaults={defaults}
        onSave={save}
        onClose={closeDialog}
      />

      <LocationsDialog open={placesOpen} locationsApi={locationsApi} itemCounts={itemCounts} onClose={closePlaces} />
    </LayoutGroup>
  );
}
