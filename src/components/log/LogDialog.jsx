import { useId, useMemo, useState } from 'react';
import { Plus, Trophy } from 'lucide-react';
import Modal, { ModalActions, ModalHeader } from '../Modal';
import { RatingInput } from '../library/Rating';
import { localDateTimeString } from '../../lib/storage';
import { KINDS, activityTypesFor, activityVerb, defaultActivityType, kindHasField } from '../../lib/kinds';
import { btnPrimary, btnSecondary, chip, field, hint, label } from '../ui';

const NOTE_HINT = {
  board: 'Final scores, a great comeback, a rule you got wrong…',
  video: 'Where you got to, a boss that took ten tries…',
  book: 'Where you stopped, a line worth keeping…',
  film: 'Who you watched with, what stayed with you…',
  music: 'Which side, what it went with…',
};

const fold = (name) => name.trim().toLowerCase();
const hasName = (list, name) => list.some((n) => fold(n) === fold(name));

function toForm(entry, prefill, knownNames, items) {
  const source = entry ?? prefill ?? {};
  const players = source.players ?? [];
  const item = items.find((i) => i.id === source.itemId);
  return {
    itemId: source.itemId ?? '',
    type: source.type ?? defaultActivityType(item),
    date: source.date ?? localDateTimeString(),
    rating: source.rating ?? 0,
    players,
    winners: (source.winners ?? []).filter((w) => hasName(players, w)),
    note: source.note ?? '',
    // Names typed in this dialog that are not known yet, kept so their chips stay visible.
    options: [...knownNames, ...players.filter((p) => !hasName(knownNames, p))],
  };
}

function validate(form, items) {
  const errors = {};
  const inLibrary = items.some((i) => i.id === form.itemId);
  if (!form.itemId || (!inLibrary && !form.keepMissing)) errors.itemId = 'Pick what this entry is for.';
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(form.date)) errors.date = 'Set when it happened.';
  return errors;
}

function NameChips({ legend, name, options, selected, onToggle, icon: Icon, empty }) {
  return (
    <fieldset className="min-w-0">
      <legend className={label}>{legend}</legend>
      {options.length === 0 ? (
        <p className={`${hint} mt-1.5`}>{empty}</p>
      ) : (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {options.map((option) => (
            <label key={option} className="relative">
              <input
                type="checkbox"
                name={name}
                value={option}
                checked={hasName(selected, option)}
                onChange={() => onToggle(option)}
                className="peer sr-only"
              />
              <span className={chip}>
                {Icon && hasName(selected, option) && <Icon aria-hidden="true" className="size-3.5 text-accent" />}
                {option}
              </span>
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}


function EntryForm({ entry, prefill, items, knownNames, onSave, onCancel, titleId }) {
  const uid = useId();
  const ids = { itemId: `${uid}-item`, date: `${uid}-date`, newName: `${uid}-new`, note: `${uid}-note` };
  const [form, setForm] = useState(() => ({
    ...toForm(entry, prefill, knownNames, items),
    keepMissing: !!entry && !items.some((i) => i.id === entry.itemId),
  }));
  const [newName, setNewName] = useState('');
  const [nameError, setNameError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Options grouped by kind, titles sorted within each.
  const groups = useMemo(
    () =>
      KINDS.map((kind) => ({
        kind,
        items: items
          .filter((i) => i.kind === kind.id)
          .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })),
      })).filter((g) => g.items.length > 0),
    [items],
  );
  const errors = submitted ? validate(form, items) : {};
  const item = items.find((i) => i.id === form.itemId) ?? null;
  // A removed item keeps the fields its entry already has.
  const kind = item?.kind ?? (entry?.winners.length ? 'board' : null);
  const types = activityTypesFor(kind);
  const showPlayers = kind ? kindHasField(kind, 'players') : form.players.length > 0;
  const showWinners = kind === 'board' || (!kind && form.winners.length > 0);
  const showRating = form.type !== 'started';

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const chooseItem = (itemId) =>
    setForm((prev) => {
      const next = items.find((i) => i.id === itemId);
      const allowed = activityTypesFor(next?.kind).some((t) => t.id === prev.type);
      // Editing keeps the entry's type when it still applies; a new entry follows the item.
      const type = entry && allowed ? prev.type : defaultActivityType(next);
      return { ...prev, itemId, type, keepMissing: false };
    });

  const togglePlayer = (name) =>
    setForm((prev) => {
      if (hasName(prev.players, name)) {
        return {
          ...prev,
          players: prev.players.filter((n) => fold(n) !== fold(name)),
          winners: prev.winners.filter((n) => fold(n) !== fold(name)),
        };
      }
      return { ...prev, players: [...prev.players, name] };
    });

  const toggleWinner = (name) =>
    setForm((prev) => ({
      ...prev,
      winners: hasName(prev.winners, name)
        ? prev.winners.filter((n) => fold(n) !== fold(name))
        : [...prev.winners, name],
    }));

  const addName = () => {
    const name = newName.trim();
    if (!name) {
      setNameError('Type a name first.');
      return;
    }
    const existing = form.options.find((n) => fold(n) === fold(name));
    setForm((prev) => ({
      ...prev,
      options: existing ? prev.options : [...prev.options, name],
      players: hasName(prev.players, name) ? prev.players : [...prev.players, existing ?? name],
    }));
    setNewName('');
    setNameError('');
  };

  const submit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    const found = validate(form, items);
    const first = ['itemId', 'date'].find((k) => found[k]);
    if (first) {
      document.getElementById(ids[first])?.focus();
      return;
    }
    // A name typed but not added yet still counts.
    const pending = newName.trim();
    const players = pending && !hasName(form.players, pending) ? [...form.players, pending] : form.players;
    onSave({
      itemId: form.itemId,
      type: types.some((t) => t.id === form.type) ? form.type : types[0].id,
      date: form.date,
      players: showPlayers ? players : [],
      winners: showWinners ? form.winners.filter((w) => hasName(players, w)) : [],
      rating: showRating ? form.rating : 0,
      note: form.note.trim(),
    });
  };

  const missing = form.keepMissing && form.itemId === entry?.itemId;
  const describedBy = (key) => (errors[key] ? `${ids[key]}-error` : undefined);
  const error = (key) =>
    errors[key] && (
      <p id={`${ids[key]}-error`} className="mt-1.5 text-sm font-medium text-danger">
        {errors[key]}
      </p>
    );

  return (
    <form noValidate onSubmit={submit} className="flex max-h-[inherit] flex-col">
      <ModalHeader id={titleId} title={entry ? 'Edit entry' : 'Log it'} onClose={onCancel} />

      <div className="space-y-5 overflow-y-auto px-5 py-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <label htmlFor={ids.itemId} className={label}>
              What
            </label>
            <select
              id={ids.itemId}
              value={form.itemId}
              onChange={(e) => chooseItem(e.target.value)}
              aria-invalid={!!errors.itemId}
              aria-describedby={describedBy('itemId')}
              className={`${field} mt-1.5 pr-8`}
            >
              <option value="" disabled>
                Choose from the library
              </option>
              {missing && <option value={entry.itemId}>Something no longer in the library</option>}
              {groups.map((g) => (
                <optgroup key={g.kind.id} label={g.kind.plural}>
                  {g.items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {error('itemId')}
          </div>
          <div className="min-w-0">
            <label htmlFor={ids.date} className={label}>
              When
            </label>
            <input
              id={ids.date}
              type="datetime-local"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              aria-invalid={!!errors.date}
              aria-describedby={describedBy('date')}
              className={`${field} tabular mt-1.5`}
            />
            {error('date')}
          </div>
        </div>

        {types.length > 1 && (
          <fieldset>
            <legend className={label}>What happened</legend>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {types.map((t) => (
                <label key={t.id} className="relative">
                  <input
                    type="radio"
                    name={`${uid}-type`}
                    value={t.id}
                    checked={form.type === t.id}
                    onChange={() => set('type', t.id)}
                    className="peer sr-only"
                  />
                  <span className={chip}>{activityVerb(kind, t.id)}</span>
                </label>
              ))}
            </div>
            {!entry && item && form.type === 'finished' && item.status !== 'done' && (
              <p className={`${hint} mt-1.5`}>Also marks it finished in the library.</p>
            )}
            {!entry && item && form.type === 'started' && item.status !== 'active' && (
              <p className={`${hint} mt-1.5`}>Also puts it on your Now shelf.</p>
            )}
          </fieldset>
        )}

        {showPlayers && (
          <div>
            <NameChips
              legend="Who played"
              name={`${uid}-players`}
              options={form.options}
              selected={form.players}
              onToggle={togglePlayer}
              empty={kind === 'board' ? 'No names yet. Add the people at the table below.' : 'Solo, or add who played below.'}
            />
            <div className="mt-2">
              <label htmlFor={ids.newName} className="sr-only">
                Add a player
              </label>
              <div className="flex gap-2">
                <input
                  id={ids.newName}
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    if (nameError) setNameError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addName();
                    }
                  }}
                  placeholder="Add a player"
                  autoComplete="off"
                  maxLength={60}
                  aria-invalid={nameError ? 'true' : undefined}
                  aria-describedby={nameError ? `${ids.newName}-error` : undefined}
                  className={field}
                />
                <button type="button" onClick={addName} className={btnSecondary}>
                  <Plus aria-hidden="true" className="size-4" strokeWidth={2.5} />
                  Add
                </button>
              </div>
              {nameError && (
                <p id={`${ids.newName}-error`} className="mt-1.5 text-sm font-medium text-danger">
                  {nameError}
                </p>
              )}
            </div>
          </div>
        )}

        {showWinners && (
          <NameChips
            legend="Who won"
            name={`${uid}-winners`}
            options={form.players}
            selected={form.winners}
            onToggle={toggleWinner}
            icon={Trophy}
            empty="Pick who played first. Leave empty for a co-op loss or no winner."
          />
        )}

        {showRating && (
          <div>
            <RatingInput
              name={`${uid}-rating`}
              value={form.rating}
              onChange={(rating) => set('rating', rating)}
              legend={form.type === 'finished' ? 'Your rating' : 'How was it'}
              legendClassName={label}
            />
            {!entry && form.type === 'finished' && form.rating > 0 && item && item.rating !== form.rating && (
              <p className={`${hint} mt-1`}>Also becomes its rating in the library.</p>
            )}
          </div>
        )}

        <div>
          <label htmlFor={ids.note} className={label}>
            Note <span className="font-normal text-muted">(optional)</span>
          </label>
          <textarea
            id={ids.note}
            rows={2}
            value={form.note}
            onChange={(e) => set('note', e.target.value)}
            maxLength={500}
            placeholder={NOTE_HINT[kind] ?? 'Anything worth remembering…'}
            className={`${field} mt-1.5 h-auto min-h-16 resize-y py-2 leading-snug`}
          />
        </div>
      </div>

      <ModalActions>
        <button type="button" onClick={onCancel} className={btnSecondary}>
          Cancel
        </button>
        <button type="submit" className={btnPrimary}>
          {entry ? 'Save changes' : 'Log it'}
        </button>
      </ModalActions>
    </form>
  );
}

/**
 * Log a new entry (optionally prefilled from an item, the Pick result or tonight's pick) or edit
 * one (`entry`). `onSave` receives `{ itemId, type, date, players, winners, rating, note }`.
 */
export default function LogDialog({ open, entry, prefill, items, knownNames, onSave, onClose }) {
  const titleId = useId();
  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId} className="w-[min(36rem,calc(100vw-2rem))]">
      <EntryForm
        titleId={titleId}
        entry={entry}
        prefill={prefill}
        items={items}
        knownNames={knownNames}
        onSave={onSave}
        onCancel={onClose}
      />
    </Modal>
  );
}
