import { useId, useMemo, useState } from 'react';
import { Plus, Trophy } from 'lucide-react';
import Modal, { ModalActions, ModalHeader } from '../Modal';
import { localDateTimeString } from '../../lib/storage';
import { btnPrimary, btnSecondary, chip, field, hint, label } from '../ui';

const fold = (name) => name.trim().toLowerCase();
const hasName = (list, name) => list.some((n) => fold(n) === fold(name));

function toForm(play, prefill, knownNames) {
  const source = play ?? prefill ?? {};
  const players = source.players ?? [];
  return {
    itemId: source.itemId ?? '',
    date: source.date ?? localDateTimeString(),
    players,
    winners: (source.winners ?? []).filter((w) => hasName(players, w)),
    note: source.note ?? '',
    // Names typed in this dialog that are not known yet, kept so their chips stay visible.
    options: [...knownNames, ...players.filter((p) => !hasName(knownNames, p))],
  };
}

function validate(form, games) {
  const errors = {};
  const onShelf = games.some((g) => g.id === form.itemId);
  if (!form.itemId || (!onShelf && !form.keepMissingGame)) errors.itemId = 'Pick the game you played.';
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(form.date)) errors.date = 'Set when you played.';
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

function PlayForm({ play, prefill, games, knownNames, onSave, onCancel, titleId }) {
  const uid = useId();
  const ids = { itemId: `${uid}-game`, date: `${uid}-date`, newName: `${uid}-new`, note: `${uid}-note` };
  const [form, setForm] = useState(() => ({
    ...toForm(play, prefill, knownNames),
    keepMissingGame: !!play && !games.some((g) => g.id === play.itemId),
  }));
  const [newName, setNewName] = useState('');
  const [nameError, setNameError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const sortedGames = useMemo(
    () => [...games].sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })),
    [games],
  );
  const errors = submitted ? validate(form, games) : {};

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

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
    const found = validate(form, games);
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
      date: form.date,
      players,
      winners: form.winners,
      note: form.note.trim(),
    });
  };

  const missingGame = form.keepMissingGame && form.itemId === play?.itemId;
  const describedBy = (key) => (errors[key] ? `${ids[key]}-error` : undefined);
  const error = (key) =>
    errors[key] && (
      <p id={`${ids[key]}-error`} className="mt-1.5 text-sm font-medium text-danger">
        {errors[key]}
      </p>
    );

  return (
    <form noValidate onSubmit={submit} className="flex max-h-[inherit] flex-col">
      <ModalHeader id={titleId} title={play ? 'Edit play' : 'Log a play'} onClose={onCancel} />

      <div className="space-y-5 overflow-y-auto px-5 py-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <label htmlFor={ids.itemId} className={label}>
              Game
            </label>
            <select
              id={ids.itemId}
              value={form.itemId}
              onChange={(e) => setForm((prev) => ({ ...prev, itemId: e.target.value, keepMissingGame: false }))}
              aria-invalid={!!errors.itemId}
              aria-describedby={describedBy('itemId')}
              className={`${field} mt-1.5 pr-8`}
            >
              <option value="" disabled>
                Choose a game
              </option>
              {missingGame && <option value={play.itemId}>A game no longer on the shelf</option>}
              {sortedGames.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
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

        <div>
          <NameChips
            legend="Who played"
            name={`${uid}-players`}
            options={form.options}
            selected={form.players}
            onToggle={togglePlayer}
            empty="No names yet. Add the people at the table below."
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

        <NameChips
          legend="Who won"
          name={`${uid}-winners`}
          options={form.players}
          selected={form.winners}
          onToggle={toggleWinner}
          icon={Trophy}
          empty="Pick who played first. Leave empty for a co-op loss or no winner."
        />

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
            placeholder="Final scores, a great comeback, a rule you got wrong…"
            className={`${field} mt-1.5 h-auto min-h-16 resize-y py-2 leading-snug`}
          />
        </div>
      </div>

      <ModalActions>
        <button type="button" onClick={onCancel} className={btnSecondary}>
          Cancel
        </button>
        <button type="submit" className={btnPrimary}>
          {play ? 'Save changes' : 'Log play'}
        </button>
      </ModalActions>
    </form>
  );
}

/**
 * Log a new play (optionally prefilled, e.g. from tonight's pick) or edit one (`play`).
 * `onSave` receives `{ itemId, date, players, winners, note }`.
 */
export default function LogPlayDialog({ open, play, prefill, games, knownNames, onSave, onClose }) {
  const titleId = useId();
  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId} className="w-[min(36rem,calc(100vw-2rem))]">
      <PlayForm
        titleId={titleId}
        play={play}
        prefill={prefill}
        games={games}
        knownNames={knownNames}
        onSave={onSave}
        onCancel={onClose}
      />
    </Modal>
  );
}
