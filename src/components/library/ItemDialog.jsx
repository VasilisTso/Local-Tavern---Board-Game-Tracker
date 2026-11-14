import { useId, useMemo, useRef, useState } from 'react';
import { Check, ImageUp, Link2, Loader2, Plus, X } from 'lucide-react';
import Modal, { ModalActions, ModalHeader } from '../Modal';
import Cover from '../covers/Cover';
import { RatingInput } from './Rating';
import { COVER_COLORS, swatchFor } from '../../lib/cover';
import { saveCoverFile } from '../../lib/coverStore';
import { KINDS, STATUSES, isDigitalFormat, kindHasField, kindMeta, lengthUnit } from '../../lib/kinds';
import { btnPrimary, btnSecondary, chip, field, hint, label } from '../ui';

const LIMITS = { players: [1, 99], length: [1, 99999], year: [1, 9999] };

const str = (value) => (value == null ? '' : String(value));

function toForm(item, defaults) {
  const kind = item?.kind ?? null;
  return {
    kind,
    format: item?.format ?? (kind ? kindMeta(kind).formats[0].id : null),
    title: item?.title ?? '',
    creator: item?.creator ?? '',
    year: str(item?.year),
    length: str(item?.length),
    minPlayers: str(item?.minPlayers ?? (item ? '' : 2)),
    maxPlayers: str(item?.maxPlayers ?? (item ? '' : 4)),
    platform: item?.platform ?? '',
    locationId: item ? (item.locationId ?? '') : (defaults.locationId ?? ''),
    status: item?.status ?? 'backlog',
    rating: item?.rating ?? 0,
    tags: item?.tags?.join(', ') ?? '',
    lentTo: item?.lentTo ?? '',
    notes: item?.notes ?? '',
    color: item?.color ?? null,
    coverId: item?.coverId ?? null,
    coverUrl: item?.coverUrl ?? '',
  };
}

const parseTags = (text) => [...new Set(text.split(',').map((t) => t.trim()).filter(Boolean))];
const wholeNumber = (text) => (/^\s*\d+\s*$/.test(text) ? Number(text) : NaN);
const optionalNumber = (text) => (text.trim() === '' ? null : wholeNumber(text));

function isHttpUrl(text) {
  try {
    const url = new URL(text.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function validate(form, takenTitles) {
  const errors = {};
  if (!form.kind) return { kind: 'Pick what kind of thing this is.' };
  const has = (f) => kindHasField(form.kind, f);
  const title = form.title.trim();
  if (!title) errors.title = 'Give it a title.';
  else if (takenTitles.has(`${form.kind}:${title.toLowerCase()}`)) {
    errors.title = `“${title}” is already in your library as a ${kindMeta(form.kind).label.toLowerCase()}.`;
  }

  if (has('year') && form.year.trim()) {
    const y = wholeNumber(form.year);
    if (!(y >= LIMITS.year[0] && y <= LIMITS.year[1])) errors.year = 'Use a year like 1999, or leave it empty.';
  }

  if (has('length') && form.length.trim()) {
    const n = wholeNumber(form.length);
    if (!(n >= LIMITS.length[0] && n <= LIMITS.length[1])) errors.length = 'Use a whole number, or leave it empty.';
  }

  if (has('players')) {
    const [lo, hi] = LIMITS.players;
    const required = form.kind === 'board';
    const min = optionalNumber(form.minPlayers);
    const max = optionalNumber(form.maxPlayers);
    const bad = (n) => (n == null ? required : !(n >= lo && n <= hi));
    if (bad(min)) errors.minPlayers = `Use a whole number from ${lo} to ${hi}.`;
    if (bad(max)) errors.maxPlayers = `Use a whole number from ${lo} to ${hi}.`;
    else if (!errors.minPlayers && min != null && max != null && max < min) {
      errors.maxPlayers = `Can’t be lower than min players (${min}).`;
    } else if (!required && (min == null) !== (max == null)) {
      errors[min == null ? 'minPlayers' : 'maxPlayers'] = 'Fill in both, or leave both empty.';
    }
  }

  if (form.coverUrl.trim() && !isHttpUrl(form.coverUrl)) errors.coverUrl = 'Use a link that starts with https://';
  return errors;
}

const FIELD_ORDER = ['kind', 'title', 'creator', 'year', 'length', 'minPlayers', 'maxPlayers', 'coverUrl'];

function Field({ id, labelText, error, hintText, className = '', children }) {
  return (
    <div className={`min-w-0 ${className}`}>
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

/** Radio chips: one choice from a short list. */
function ChipChoice({ legend, name, options, value, onChange, error, errorId }) {
  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className={label}>{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <label key={option.id} className="relative">
              <input
                type="radio"
                name={name}
                value={option.id}
                checked={value === option.id}
                onChange={() => onChange(option.id)}
                className="peer sr-only"
              />
              <span className={chip}>
                {Icon && <Icon aria-hidden="true" className="size-4" />}
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}

/** The first question for a new item: big, plain choices. */
function KindChoice({ name, value, onChange, error, errorId }) {
  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className={label}>What are you adding?</legend>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {KINDS.map((kind) => {
          const Icon = kind.icon;
          return (
            <label key={kind.id} className="relative">
              <input
                type="radio"
                name={name}
                value={kind.id}
                checked={value === kind.id}
                onChange={() => onChange(kind.id)}
                className="peer sr-only"
                data-autofocus={value == null && kind.id === KINDS[0].id ? true : undefined}
              />
              <span className="flex h-full min-h-20 flex-col items-center justify-center gap-1.5 rounded-md border border-line px-2 py-3 text-center text-sm font-semibold text-muted transition-colors duration-150 hover:border-line-strong hover:text-ink peer-checked:border-accent peer-checked:bg-raised peer-checked:text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
                <Icon aria-hidden="true" className="size-6" strokeWidth={1.75} />
                {kind.label}
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}

/** Cover color: "From title" (the generated hue) or one of the object palette hues. */
function ColorPicker({ name, value, onChange }) {
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
        Cover color <span className="font-normal text-muted">· {current.label}</span>
      </legend>
      <div className="mt-2 flex flex-wrap gap-1">
        {options.map((option) => {
          const checked = option.id === value;
          return (
            <label key={option.id ?? 'auto'} title={option.label} className="relative cursor-pointer">
              <input type="radio" name={name} checked={checked} onChange={() => onChange(option.id)} className="peer sr-only" />
              <span className="sr-only">{option.label}</span>
              <span
                aria-hidden="true"
                className={`grid size-8 place-items-center rounded-full border-2 transition-[border-color,transform] duration-150 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent hover:scale-105 ${
                  checked ? 'border-ink' : 'border-transparent'
                }`}
              >
                <span className="grid size-6 place-items-center rounded-full" style={{ background: option.fill }}>
                  {checked && <Check className="size-3.5 text-white drop-shadow" strokeWidth={3} />}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Uploaded image (stored in IndexedDB at once, so the preview can show it) or an image link. */
function CoverImage({ ids, form, setForm, error, describedBy }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showUrl, setShowUrl] = useState(Boolean(form.coverUrl));

  const onFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true);
    setUploadError('');
    try {
      const coverId = await saveCoverFile(file);
      setForm((prev) => ({ ...prev, coverId }));
    } catch (err) {
      setUploadError(err?.message || 'Couldn’t read that image.');
    } finally {
      setBusy(false);
    }
  };

  const hasImage = Boolean(form.coverId || form.coverUrl.trim());

  return (
    <fieldset>
      <legend className={label}>Cover image</legend>
      <p className={`mt-1 ${hint}`}>Optional. It sits inside the object, so a book still looks like a book.</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <input ref={fileRef} id={ids.file} type="file" accept="image/*" onChange={onFile} className="sr-only" tabIndex={-1} />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className={btnSecondary}>
          {busy ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : <ImageUp aria-hidden="true" className="size-4" />}
          {form.coverId ? 'Replace image' : 'Upload image'}
        </button>
        {!showUrl && (
          <button type="button" onClick={() => setShowUrl(true)} className={btnSecondary}>
            <Link2 aria-hidden="true" className="size-4" />
            Use a link
          </button>
        )}
        {hasImage && (
          <button
            type="button"
            onClick={() => {
              setForm((prev) => ({ ...prev, coverId: null, coverUrl: '' }));
              setShowUrl(false);
            }}
            className={`${btnSecondary} hover:text-danger`}
          >
            <X aria-hidden="true" className="size-4" />
            Remove image
          </button>
        )}
      </div>
      <p role="status" className="sr-only">
        {busy ? 'Resizing the image…' : form.coverId ? 'Image uploaded.' : ''}
      </p>
      {uploadError && <p className="mt-1.5 text-sm font-medium text-danger">{uploadError}</p>}
      {showUrl && (
        <Field id={ids.coverUrl} labelText="Image link" error={error} className="mt-3" hintText={form.coverId ? 'The uploaded image is used first.' : undefined}>
          <input
            id={ids.coverUrl}
            type="url"
            inputMode="url"
            value={form.coverUrl}
            onChange={(e) => setForm((prev) => ({ ...prev, coverUrl: e.target.value }))}
            placeholder="https://"
            autoComplete="off"
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={field}
          />
        </Field>
      )}
    </fieldset>
  );
}

function ItemForm({ item, items, locations, allTags, defaults, onSave, onCancel, titleId }) {
  const uid = useId();
  const ids = Object.fromEntries(
    [...FIELD_ORDER, 'tags', 'platform', 'location', 'lentTo', 'notes', 'file'].map((k) => [k, `${uid}-${k}`]),
  );
  const [form, setForm] = useState(() => toForm(item, defaults));
  const [submitted, setSubmitted] = useState(false);

  const takenTitles = useMemo(
    () => new Set(items.filter((i) => i.id !== item?.id).map((i) => `${i.kind}:${i.title.trim().toLowerCase()}`)),
    [items, item],
  );

  const update = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
  };
  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const setKind = (kind) =>
    setForm((prev) => (prev.kind === kind ? prev : { ...prev, kind, format: kindMeta(kind).formats[0].id }));

  const liveErrors = submitted ? validate(form, takenTitles) : {};
  const meta = form.kind ? kindMeta(form.kind) : null;
  const has = (f) => (form.kind ? kindHasField(form.kind, f) : false);
  const unit = form.kind ? lengthUnit(form.kind, form.format) : 'min';
  const physical = form.format ? !isDigitalFormat(form.format) : true;

  const typedTags = parseTags(form.tags);
  const fragment = form.tags.split(',').at(-1).trim().toLowerCase();
  const suggestions = allTags
    .filter((t) => !typedTags.some((x) => x.toLowerCase() === t.toLowerCase()))
    .filter((t) => !fragment || t.toLowerCase().includes(fragment))
    .slice(0, 8);

  const addTag = (tag) => {
    const parts = form.tags.split(',');
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
      const target =
        first === 'kind'
          ? document.querySelector(`input[name="${uid}-kind"]`)
          : document.getElementById(ids[first]);
      target?.focus();
      return;
    }
    onSave({
      kind: form.kind,
      format: form.format,
      title: form.title.trim(),
      creator: form.creator.trim(),
      year: optionalNumber(form.year),
      length: optionalNumber(form.length),
      minPlayers: has('players') ? optionalNumber(form.minPlayers) : null,
      maxPlayers: has('players') ? optionalNumber(form.maxPlayers) : null,
      platform: form.platform.trim(),
      locationId: form.locationId || null,
      status: form.status,
      rating: form.rating,
      tags: typedTags,
      lentTo: physical ? form.lentTo.trim() : '',
      notes: form.notes.trim(),
      color: form.color,
      coverId: form.coverId,
      coverUrl: form.coverUrl.trim() || null,
    });
  };

  const describedBy = (key, withHint = false) =>
    liveErrors[key] ? `${ids[key]}-error` : withHint ? `${ids[key]}-hint` : undefined;

  const preview = {
    title: form.title.trim() || 'Untitled',
    creator: form.creator.trim(),
    kind: form.kind ?? 'board',
    format: form.format ?? 'box',
    color: form.color,
    coverId: form.coverId,
    coverUrl: isHttpUrl(form.coverUrl) ? form.coverUrl.trim() : null,
    length: optionalNumber(form.length) || null,
    minPlayers: optionalNumber(form.minPlayers) || null,
    maxPlayers: optionalNumber(form.maxPlayers) || null,
    platform: form.platform.trim(),
  };

  const heading = item ? `Edit ${item.title}` : meta ? `Add a ${meta.label.toLowerCase()}` : 'Add to the library';

  return (
    <form noValidate onSubmit={submit} className="flex max-h-[inherit] flex-col">
      <ModalHeader id={titleId} title={heading} onClose={onCancel} />

      <div className="space-y-5 overflow-y-auto px-5 py-4">
        {item ? (
          <ChipChoice legend="Kind" name={`${uid}-kind`} options={KINDS} value={form.kind} onChange={setKind} />
        ) : (
          <KindChoice
            name={`${uid}-kind`}
            value={form.kind}
            onChange={setKind}
            error={liveErrors.kind}
            errorId={`${ids.kind}-error`}
          />
        )}

        {meta && (
          <>
            <ChipChoice legend="Format" name={`${uid}-format`} options={meta.formats} value={form.format} onChange={set('format')} />

            <div className="flex gap-5">
              <div className="min-w-0 flex-1 space-y-4">
                <Field id={ids.title} labelText="Title" error={liveErrors.title}>
                  <input
                    id={ids.title}
                    value={form.title}
                    onChange={update('title')}
                    autoComplete="off"
                    maxLength={120}
                    data-autofocus={item ? true : undefined}
                    aria-invalid={!!liveErrors.title}
                    aria-describedby={describedBy('title')}
                    className={field}
                  />
                </Field>
                {has('creator') && (
                  <Field id={ids.creator} labelText={meta.creatorLabel}>
                    <input id={ids.creator} value={form.creator} onChange={update('creator')} autoComplete="off" maxLength={120} className={field} />
                  </Field>
                )}
              </div>
              <div className="hidden w-24 shrink-0 items-end sm:flex" aria-hidden="true">
                <Cover item={preview} className="w-full" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {has('year') && (
                <Field id={ids.year} labelText="Year" error={liveErrors.year}>
                  <input
                    id={ids.year}
                    inputMode="numeric"
                    value={form.year}
                    onChange={update('year')}
                    placeholder="Optional"
                    aria-invalid={!!liveErrors.year}
                    aria-describedby={describedBy('year')}
                    className={`${field} tabular`}
                  />
                </Field>
              )}
              {has('length') && (
                <Field id={ids.length} labelText={unit === 'pages' ? 'Pages' : 'Length (min)'} error={liveErrors.length}>
                  <input
                    id={ids.length}
                    inputMode="numeric"
                    value={form.length}
                    onChange={update('length')}
                    placeholder="Optional"
                    aria-invalid={!!liveErrors.length}
                    aria-describedby={describedBy('length')}
                    className={`${field} tabular`}
                  />
                </Field>
              )}
              {has('players') && (
                <>
                  <Field id={ids.minPlayers} labelText="Min players" error={liveErrors.minPlayers}>
                    <input
                      id={ids.minPlayers}
                      inputMode="numeric"
                      value={form.minPlayers}
                      onChange={update('minPlayers')}
                      placeholder={form.kind === 'board' ? undefined : 'Optional'}
                      aria-invalid={!!liveErrors.minPlayers}
                      aria-describedby={describedBy('minPlayers')}
                      className={`${field} tabular`}
                    />
                  </Field>
                  <Field id={ids.maxPlayers} labelText="Max players" error={liveErrors.maxPlayers}>
                    <input
                      id={ids.maxPlayers}
                      inputMode="numeric"
                      value={form.maxPlayers}
                      onChange={update('maxPlayers')}
                      placeholder={form.kind === 'board' ? undefined : 'Optional'}
                      aria-invalid={!!liveErrors.maxPlayers}
                      aria-describedby={describedBy('maxPlayers')}
                      className={`${field} tabular`}
                    />
                  </Field>
                </>
              )}
            </div>

            {has('platform') && (
              <Field id={ids.platform} labelText="Platform">
                <input
                  id={ids.platform}
                  value={form.platform}
                  onChange={update('platform')}
                  autoComplete="off"
                  maxLength={40}
                  placeholder="e.g. Switch, PS5, PC"
                  className={field}
                />
              </Field>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id={ids.location} labelText="Place">
                <select id={ids.location} value={form.locationId} onChange={update('locationId')} className={`${field} pr-8`}>
                  <option value="">No place yet</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </Field>
              {physical && (
                <Field id={ids.lentTo} labelText="Lent to" hintText="Leave empty when it’s home.">
                  <input
                    id={ids.lentTo}
                    value={form.lentTo}
                    onChange={update('lentTo')}
                    autoComplete="off"
                    maxLength={60}
                    aria-describedby={`${ids.lentTo}-hint`}
                    className={field}
                  />
                </Field>
              )}
            </div>

            <ChipChoice legend="Status" name={`${uid}-status`} options={STATUSES} value={form.status} onChange={set('status')} />

            <RatingInput name={`${uid}-rating`} value={form.rating} onChange={set('rating')} legendClassName={label} />

            <div>
              <Field id={ids.tags} labelText="Tags" hintText="Separate with commas.">
                <input
                  id={ids.tags}
                  value={form.tags}
                  onChange={update('tags')}
                  autoComplete="off"
                  aria-describedby={describedBy('tags', true)}
                  className={field}
                />
              </Field>
              {suggestions.length > 0 && (
                <div className="mt-2">
                  <p className="sr-only" id={`${ids.tags}-suggest`}>
                    Tags already in your library
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
            </div>

            <div className="flex gap-4 sm:block">
              <div className="w-20 shrink-0 self-end sm:hidden" aria-hidden="true">
                <Cover item={preview} className="w-full" />
              </div>
              <div className="min-w-0 flex-1">
                <ColorPicker name={`${uid}-color`} value={form.color} onChange={set('color')} />
              </div>
            </div>

            <CoverImage
              ids={ids}
              form={form}
              setForm={setForm}
              error={liveErrors.coverUrl}
              describedBy={describedBy('coverUrl')}
            />

            <Field id={ids.notes} labelText="Notes">
              <textarea
                id={ids.notes}
                value={form.notes}
                onChange={update('notes')}
                rows={3}
                maxLength={2000}
                className={`${field} h-auto py-2`}
              />
            </Field>
          </>
        )}
      </div>

      <ModalActions>
        <button type="button" onClick={onCancel} className={btnSecondary}>
          Cancel
        </button>
        <button type="submit" className={btnPrimary}>
          {item ? 'Save changes' : 'Add to library'}
        </button>
      </ModalActions>
    </form>
  );
}

/** Modal for adding (item = null) or editing an item. New items start with the kind question. */
export default function ItemDialog({ open, item, items, locations, allTags, defaults = {}, onSave, onClose }) {
  const titleId = useId();
  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId} className="w-[min(40rem,calc(100vw-2rem))]">
      <ItemForm
        titleId={titleId}
        item={item}
        items={items}
        locations={locations}
        allTags={allTags}
        defaults={defaults}
        onSave={onSave}
        onCancel={onClose}
      />
    </Modal>
  );
}
