import { useId, useMemo, useState } from 'react';
import { Check, Plus } from 'lucide-react';
import Modal, { ModalActions, ModalHeader } from '../Modal';
import Cover from '../covers/Cover';
import { COVER_COLORS, swatchFor } from '../../lib/cover';
import { btnPrimary, btnSecondary, field, hint, label } from '../ui';

const LIMITS = { players: [1, 99], playtime: [1, 1440] };

function toForm(game) {
  return {
    title: game?.title ?? '',
    minPlayers: String(game?.minPlayers ?? 2),
    maxPlayers: String(game?.maxPlayers ?? 4),
    playtime: game?.length == null ? (game ? '' : '60') : String(game.length),
    tags: game?.tags?.join(', ') ?? '',
    color: game?.color ?? null,
  };
}

const parseTags = (text) => [...new Set(text.split(',').map((t) => t.trim()).filter(Boolean))];

const wholeNumber = (text) => (/^\s*\d+\s*$/.test(text) ? Number(text) : NaN);

function validate(form, takenTitles) {
  const errors = {};
  const title = form.title.trim();
  if (!title) errors.title = 'Give the game a title.';
  else if (takenTitles.has(title.toLowerCase())) errors.title = `“${title}” is already on the shelf.`;

  const [lo, hi] = LIMITS.players;
  const min = wholeNumber(form.minPlayers);
  const max = wholeNumber(form.maxPlayers);
  if (!(min >= lo && min <= hi)) errors.minPlayers = `Use a whole number from ${lo} to ${hi}.`;
  if (!(max >= lo && max <= hi)) errors.maxPlayers = `Use a whole number from ${lo} to ${hi}.`;
  else if (!errors.minPlayers && max < min) errors.maxPlayers = `Can’t be lower than min players (${min}).`;

  if (form.playtime.trim() !== '') {
    const t = wholeNumber(form.playtime);
    if (!(t >= LIMITS.playtime[0] && t <= LIMITS.playtime[1])) {
      errors.playtime = 'Use minutes from 1 to 1440, or leave it empty.';
    }
  }
  return errors;
}

const FIELD_ORDER = ['title', 'minPlayers', 'maxPlayers', 'playtime'];

function Field({ id, labelText, error, hintText, children }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className={label}>
        {labelText}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-danger">
          {error}
        </p>
      ) : (
        hintText && (
          <p id={`${id}-hint`} className={`mt-1.5 ${hint}`}>
            {hintText}
          </p>
        )
      )}
    </div>
  );
}

/** Box color: "From title" (the generated hue) or one of the curated cover colors, with a live preview. */
function ColorPicker({ name, title, value, onChange }) {
  const options = [
    {
      id: null,
      label: 'From title',
      fill: `conic-gradient(${[...COVER_COLORS, COVER_COLORS[0]].map((c) => swatchFor(c.id)).join(', ')})`,
    },
    ...COVER_COLORS.map((c) => ({ id: c.id, label: c.label, fill: swatchFor(c.id) })),
  ];
  const current = options.find((o) => o.id === value) ?? options[0];

  return (
    <fieldset>
      <legend className={label}>
        Box color <span className="font-normal text-muted">· {current.label}</span>
      </legend>
      <div className="mt-2 flex gap-4">
        <Cover
          item={{ title: title || '?', color: value, kind: 'board', format: 'box' }}
          className="w-14 shrink-0 self-start"
        />
        <div className="flex min-w-0 flex-1 flex-wrap content-start gap-1">
          {options.map((option) => {
            const checked = option.id === value;
            return (
              <label key={option.id ?? 'auto'} title={option.label} className="relative cursor-pointer">
                <input
                  type="radio"
                  name={name}
                  checked={checked}
                  onChange={() => onChange(option.id)}
                  className="peer sr-only"
                />
                <span className="sr-only">{option.label}</span>
                <span
                  aria-hidden="true"
                  className={`grid size-8 place-items-center rounded-full border-2 transition-[border-color,transform] duration-150 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent hover:scale-105 ${
                    checked ? 'border-ink' : 'border-transparent'
                  }`}
                >
                  <span
                    className="grid size-6 place-items-center rounded-full"
                    style={{ background: option.fill }}
                  >
                    {checked && <Check className="size-3.5 text-white drop-shadow" strokeWidth={3} />}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </fieldset>
  );
}

function GameForm({ game, games, allTags, onSave, onCancel, titleId }) {
  const uid = useId();
  const ids = Object.fromEntries([...FIELD_ORDER, 'tags'].map((k) => [k, `${uid}-${k}`]));
  const [form, setForm] = useState(() => toForm(game));
  const [submitted, setSubmitted] = useState(false);

  const takenTitles = useMemo(
    () => new Set(games.filter((g) => g.id !== game?.id).map((g) => g.title.trim().toLowerCase())),
    [games, game],
  );

  const update = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // After the first submit, errors follow the form as the user fixes it.
  const liveErrors = submitted ? validate(form, takenTitles) : {};

  const typedTags = parseTags(form.tags);
  const fragment = form.tags.split(',').at(-1).trim().toLowerCase();
  const suggestions = allTags
    .filter((t) => !typedTags.some((x) => x.toLowerCase() === t.toLowerCase()))
    .filter((t) => !fragment || t.toLowerCase().includes(fragment))
    .slice(0, 8);

  const addTag = (tag) => {
    const parts = form.tags.split(',');
    // Replace the half-typed fragment if it is a prefix of the suggestion.
    if (fragment && tag.toLowerCase().includes(fragment)) parts.pop();
    const next = [...parts.map((p) => p.trim()).filter(Boolean), tag].join(', ');
    setForm((prev) => ({ ...prev, tags: `${next}, ` }));
    document.getElementById(ids.tags)?.focus();
  };

  const submit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    const found = validate(form, takenTitles);
    const first = FIELD_ORDER.find((k) => found[k]);
    if (first) {
      document.getElementById(ids[first])?.focus();
      return;
    }
    onSave({
      title: form.title.trim(),
      minPlayers: wholeNumber(form.minPlayers),
      maxPlayers: wholeNumber(form.maxPlayers),
      length: form.playtime.trim() === '' ? null : wholeNumber(form.playtime),
      tags: typedTags,
      color: form.color,
    });
  };

  const describedBy = (key, withHint = false) =>
    liveErrors[key] ? `${ids[key]}-error` : withHint ? `${ids[key]}-hint` : undefined;

  return (
    <form noValidate onSubmit={submit} className="flex max-h-[inherit] flex-col">
      <ModalHeader id={titleId} title={game ? `Edit ${game.title}` : 'Add a game'} onClose={onCancel} />

      <div className="space-y-4 overflow-y-auto px-5 py-4">
        <Field id={ids.title} labelText="Title" error={liveErrors.title}>
          <input
            id={ids.title}
            value={form.title}
            onChange={update('title')}
            autoComplete="off"
            maxLength={120}
            placeholder="e.g. Ticket to Ride"
            aria-invalid={!!liveErrors.title}
            aria-describedby={describedBy('title')}
            className={field}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Field id={ids.minPlayers} labelText="Min players" error={liveErrors.minPlayers}>
            <input
              id={ids.minPlayers}
              type="number"
              inputMode="numeric"
              min={1}
              max={99}
              value={form.minPlayers}
              onChange={update('minPlayers')}
              aria-invalid={!!liveErrors.minPlayers}
              aria-describedby={describedBy('minPlayers')}
              className={`${field} tabular`}
            />
          </Field>
          <Field id={ids.maxPlayers} labelText="Max players" error={liveErrors.maxPlayers}>
            <input
              id={ids.maxPlayers}
              type="number"
              inputMode="numeric"
              min={1}
              max={99}
              value={form.maxPlayers}
              onChange={update('maxPlayers')}
              aria-invalid={!!liveErrors.maxPlayers}
              aria-describedby={describedBy('maxPlayers')}
              className={`${field} tabular`}
            />
          </Field>
          <div className="col-span-2 sm:col-span-1">
            <Field id={ids.playtime} labelText="Playtime (min)" error={liveErrors.playtime}>
              <input
                id={ids.playtime}
                type="number"
                inputMode="numeric"
                min={1}
                max={1440}
                step={5}
                value={form.playtime}
                onChange={update('playtime')}
                placeholder="Optional"
                aria-invalid={!!liveErrors.playtime}
                aria-describedby={describedBy('playtime')}
                className={`${field} tabular`}
              />
            </Field>
          </div>
        </div>

        <Field id={ids.tags} labelText="Tags" hintText="Separate with commas.">
          <input
            id={ids.tags}
            value={form.tags}
            onChange={update('tags')}
            autoComplete="off"
            placeholder="e.g. Strategy, Trains, Family"
            aria-describedby={describedBy('tags', true)}
            className={field}
          />
        </Field>
        {suggestions.length > 0 && (
          <div className="-mt-1">
            <p className="sr-only" id={`${ids.tags}-suggest`}>
              Tags already on your shelf
            </p>
            <ul className="flex flex-wrap gap-1.5" aria-labelledby={`${ids.tags}-suggest`}>
              {suggestions.map((tag) => (
                <li key={tag}>
                  <button
                    type="button"
                    onClick={() => addTag(tag)}
                    className="inline-flex h-8 items-center rounded-sm border border-dashed border-line-strong px-2 text-xs font-medium text-muted hover:border-solid hover:text-ink"
                  >
                    <Plus aria-hidden="true" className="mr-0.5 size-3" strokeWidth={2.5} />
                    <span className="sr-only">Add tag </span>
                    {tag}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <ColorPicker
          name={`${uid}-color`}
          title={form.title.trim()}
          value={form.color}
          onChange={(color) => setForm((prev) => ({ ...prev, color }))}
        />
      </div>

      <ModalActions>
        <button type="button" onClick={onCancel} className={btnSecondary}>
          Cancel
        </button>
        <button type="submit" className={btnPrimary}>
          {game ? 'Save changes' : 'Add to shelf'}
        </button>
      </ModalActions>
    </form>
  );
}

/** Modal for adding (game = null) or editing a game. */
export default function GameDialog({ open, game, games, allTags, onSave, onClose }) {
  const titleId = useId();
  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId}>
      <GameForm
        titleId={titleId}
        game={game}
        games={games}
        allTags={allTags}
        onSave={onSave}
        onCancel={onClose}
      />
    </Modal>
  );
}
