import { useId, useState } from 'react';
import { Plus, Trash2, Undo2 } from 'lucide-react';
import Modal, { ModalActions, ModalHeader } from '../Modal';
import { LOCATION_KINDS } from '../../lib/kinds';
import { countLabel } from '../../lib/format';
import { btnPrimary, btnSecondary, field, iconBtnDanger, label } from '../ui';


/** One place: rename in place (saved on blur or Enter; an empty name snaps back), kind, remove. */
function PlaceRow({ location, items, onUpdate, onRemove }) {
  const nameId = useId();
  const [draft, setDraft] = useState(location.name);
  const commit = () => {
    const name = draft.trim();
    if (!name) setDraft(location.name);
    else if (name !== location.name) onUpdate(location.id, { name });
  };
  const Icon = LOCATION_KINDS.find((k) => k.id === location.kind)?.icon;

  return (
    <li className="flex flex-wrap items-center gap-2 py-2.5 sm:flex-nowrap">
      {Icon && <Icon aria-hidden="true" className="size-4 shrink-0 text-muted" />}
      <label htmlFor={nameId} className="sr-only">
        Name of {location.name}
      </label>
      <input
        id={nameId}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          }
        }}
        maxLength={60}
        autoComplete="off"
        className={`${field} min-w-0 flex-1 max-sm:basis-[calc(100%-1.5rem)]`}
      />
      <select
        aria-label={`Kind of place for ${location.name}`}
        value={location.kind}
        onChange={(e) => onUpdate(location.id, { kind: e.target.value })}
        className={`${field} w-44! shrink-0 pr-8 max-sm:w-auto! max-sm:flex-1`}
      >
        {LOCATION_KINDS.map((k) => (
          <option key={k.id} value={k.id}>
            {k.label}
          </option>
        ))}
      </select>
      <span className="tabular w-16 shrink-0 text-right text-sm text-muted">{countLabel(items, 'item')}</span>
      <button type="button" onClick={() => onRemove(location)} aria-label={`Remove ${location.name}`} className={iconBtnDanger}>
        <Trash2 aria-hidden="true" className="size-4" />
      </button>
    </li>
  );
}

/**
 * Manage places. Removing a place never removes items: they show under "No place yet" until
 * moved. Each removal can be undone right here; whatever is still removed on close gets an Undo
 * toast (see `onClose`).
 */
function PlacesForm({ locationsApi, itemCounts, titleId, removed, setRemoved, onDone }) {
  const uid = useId();
  const { locations, addLocation, updateLocation, removeLocation, restoreLocation } = locationsApi;
  const [name, setName] = useState('');
  const [kind, setKind] = useState('physical');
  const [error, setError] = useState('');

  const add = (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Name the place.');
      document.getElementById(`${uid}-name`)?.focus();
      return;
    }
    if (locations.some((l) => l.name.toLowerCase() === trimmed.toLowerCase())) {
      setError(`You already have a place called “${trimmed}”.`);
      document.getElementById(`${uid}-name`)?.focus();
      return;
    }
    addLocation({ name: trimmed, kind });
    setName('');
    setError('');
  };

  const remove = (location) => {
    const entry = removeLocation(location.id);
    if (entry) setRemoved((prev) => [entry, ...prev]);
  };

  const undo = (entry) => {
    restoreLocation(entry);
    setRemoved((prev) => prev.filter((e) => e !== entry));
  };

  return (
    <div className="flex max-h-[inherit] flex-col">
      <ModalHeader id={titleId} title="Places" onClose={onDone} />

      <div className="space-y-5 overflow-y-auto px-5 py-4">
        <p className="text-sm text-muted">
          Shelves, rooms, apps and accounts. Removing a place keeps its items; they wait under “No place yet”.
        </p>

        {locations.length > 0 ? (
          <ul className="divide-y divide-line border-y border-line">
            {locations.map((location) => (
              <PlaceRow
                key={location.id}
                location={location}
                items={itemCounts.get(location.id) ?? 0}
                onUpdate={updateLocation}
                onRemove={remove}
              />
            ))}
          </ul>
        ) : (
          <p className="rounded-md border border-dashed border-line-strong px-4 py-6 text-center text-sm text-muted">No places yet.</p>
        )}

        {removed.length > 0 && (
          <ul className="space-y-1.5" aria-label="Removed places">
            {removed.map((entry) => (
              <li key={entry.item.id} className="flex items-center gap-2 rounded-md bg-raised py-1 pr-1 pl-3 text-sm">
                <span className="min-w-0 flex-1">
                  Removed <strong className="font-semibold">{entry.item.name}</strong>
                  {itemCounts.get(entry.item.id) ? ` · ${countLabel(itemCounts.get(entry.item.id), 'item')} now have no place` : ''}
                </span>
                <button
                  type="button"
                  onClick={() => undo(entry)}
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md px-3 font-semibold text-accent hover:bg-surface"
                >
                  <Undo2 aria-hidden="true" className="size-4" />
                  Undo
                </button>
              </li>
            ))}
          </ul>
        )}

        <form noValidate onSubmit={add} className="space-y-3 rounded-md border border-line p-4">
          <h3 className="font-display text-lg font-bold">Add a place</h3>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1">
              <label htmlFor={`${uid}-name`} className={label}>
                Name
              </label>
              <input
                id={`${uid}-name`}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                maxLength={60}
                autoComplete="off"
                placeholder="e.g. Hallway bookcase"
                aria-invalid={!!error}
                aria-describedby={error ? `${uid}-error` : undefined}
                className={`${field} mt-1.5`}
              />
              {error && (
                <p id={`${uid}-error`} className="mt-1.5 text-sm font-medium text-danger">
                  {error}
                </p>
              )}
            </div>
            <div>
              <label htmlFor={`${uid}-kind`} className={label}>
                Kind
              </label>
              <select id={`${uid}-kind`} value={kind} onChange={(e) => setKind(e.target.value)} className={`${field} mt-1.5 pr-8`}>
                {LOCATION_KINDS.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.label}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className={`${btnSecondary} sm:mt-7`}>
              <Plus aria-hidden="true" className="size-4" strokeWidth={2.5} />
              Add
            </button>
          </div>
        </form>
      </div>

      <ModalActions>
        <button type="button" onClick={onDone} className={btnPrimary}>
          Done
        </button>
      </ModalActions>
    </div>
  );
}

/** `onClose(removed)`: the `{ item, index }` entries still removed, newest first. */
export default function LocationsDialog({ open, locationsApi, itemCounts, onClose }) {
  const titleId = useId();
  const [removed, setRemoved] = useState([]); // newest first
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setRemoved([]);
  }
  // Esc, the backdrop, Done and the native close event all land here; only the first one counts.
  const close = () => {
    if (open) onClose(removed);
  };

  return (
    <Modal open={open} onClose={close} labelledBy={titleId} className="w-[min(38rem,calc(100vw-2rem))]">
      <PlacesForm
        locationsApi={locationsApi}
        itemCounts={itemCounts}
        titleId={titleId}
        removed={removed}
        setRemoved={setRemoved}
        onDone={close}
      />
    </Modal>
  );
}
