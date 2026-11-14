import { useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { btnSecondary, field, hint, iconBtnDanger, label } from '../ui';

const STATUSES = [
  { id: 'going', label: 'Going', on: 'peer-checked:border-ok peer-checked:text-ok' },
  { id: 'maybe', label: 'Maybe', on: 'peer-checked:border-accent peer-checked:text-accent' },
  { id: 'not-going', label: 'Out', on: 'peer-checked:border-danger peer-checked:text-danger' },
];

const segment =
  'flex h-9 min-w-14 items-center justify-center px-2.5 text-sm font-medium text-muted transition-colors duration-150 hover:text-ink border border-transparent rounded-[3px] peer-checked:bg-raised peer-focus-visible:outline-2 peer-focus-visible:outline-offset-1 peer-focus-visible:outline-accent';

/** Text input that keeps a local draft and commits on blur / Enter (storage trims text). */
function DraftInput({ value, onCommit, multiline = false, ...props }) {
  const [draft, setDraft] = useState(value);
  const [source, setSource] = useState(value);
  // Pick up outside changes (another tab, import) when not mid-edit.
  if (value !== source) {
    setSource(value);
    setDraft(value);
  }
  const commit = () => {
    if (draft.trim() !== value) onCommit(draft);
  };
  const onKeyDown = (event) => {
    if (event.key === 'Enter' && !(multiline && event.shiftKey)) {
      event.preventDefault();
      commit();
      event.currentTarget.blur();
    } else if (event.key === 'Escape') {
      setDraft(value);
      event.currentTarget.blur();
    }
  };
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <Tag
      {...props}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={onKeyDown}
    />
  );
}

function GuestRow({ guest, onStatus, onNote, onRemove }) {
  const uid = useId();
  const out = guest.status === 'not-going';
  return (
    <div className="py-2.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p
          className={`min-w-0 flex-1 basis-32 truncate font-semibold ${out ? 'text-muted line-through decoration-1' : 'text-ink'}`}
        >
          {guest.name}
        </p>
        <fieldset className="flex rounded-md border border-line p-0.5">
          <legend className="sr-only">RSVP for {guest.name}</legend>
          {STATUSES.map((s) => (
            <label key={s.id} className="relative">
              <input
                type="radio"
                name={`${uid}-status`}
                value={s.id}
                checked={guest.status === s.id}
                onChange={() => onStatus(guest.id, s.id)}
                className="peer sr-only"
              />
              <span className={`${segment} ${s.on}`}>{s.label}</span>
            </label>
          ))}
        </fieldset>
        <button
          type="button"
          onClick={() => onRemove(guest)}
          aria-label={`Remove ${guest.name} from the guest list`}
          className={`${iconBtnDanger} -mr-2`}
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
      <label htmlFor={`${uid}-note`} className="sr-only">
        Note for {guest.name}
      </label>
      <DraftInput
        id={`${uid}-note`}
        value={guest.note}
        onCommit={(note) => onNote(guest.id, note)}
        placeholder="Add a note (bringing snacks, late…)"
        maxLength={200}
        className="-mx-2 mt-1 h-9 w-[calc(100%+1rem)] rounded-sm border border-transparent bg-transparent px-2 text-sm text-muted transition-colors duration-150 hover:border-line focus:border-line-strong focus:bg-surface focus:text-ink"
      />
    </div>
  );
}

export default function NightPanel({ nightApi, toast }) {
  const { night, setDate, setHouseRule, addGuest, updateGuest, removeGuest, restoreGuest } = nightApi;
  const uid = useId();
  const reduceMotion = useReducedMotion();
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  const submitGuest = (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Type a name first.');
      return;
    }
    if (night.guests.some((g) => g.name.toLowerCase() === trimmed.toLowerCase())) {
      setNameError(`${trimmed} is already on the list.`);
      return;
    }
    if (addGuest(trimmed)) {
      setName('');
      setNameError('');
    }
  };

  const remove = (guest) => {
    const removed = removeGuest(guest.id);
    if (!removed) return;
    toast.show({
      message: `Removed ${guest.name}.`,
      actionLabel: 'Undo',
      onAction: () => restoreGuest(removed),
    });
  };

  const rowMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, height: 0 },
        animate: { opacity: 1, height: 'auto', transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] } },
        exit: { opacity: 0, height: 0, transition: { duration: 0.16 } },
      };

  return (
    <section aria-labelledby={`${uid}-heading`} className="rounded-md border border-line bg-surface p-4 sm:p-5">
      <h3 id={`${uid}-heading`} className="font-display text-xl font-bold">
        The table
      </h3>

      <div className="mt-4">
        <label htmlFor={`${uid}-date`} className={label}>
          When
        </label>
        <input
          id={`${uid}-date`}
          type="datetime-local"
          value={night.date}
          onChange={(e) => e.target.value && setDate(e.target.value)}
          className={`${field} tabular mt-1.5 sm:max-w-64`}
        />
      </div>

      <div className="mt-6">
        <h4 className={label}>
          Guests <span className="tabular font-normal text-muted">· you plus {night.guests.length}</span>
        </h4>
        {night.guests.length === 0 ? (
          <p className={`${hint} mt-2`}>
            No one on the list yet. Add the friends you invited; the wheel sizes games to who is going.
          </p>
        ) : (
          <ul className="mt-1 divide-y divide-line border-b border-line">
            <AnimatePresence initial={false}>
              {night.guests.map((guest) => (
                <motion.li key={guest.id} {...rowMotion} className="overflow-hidden">
                  <GuestRow
                    guest={guest}
                    onStatus={(id, status) => updateGuest(id, { status })}
                    onNote={(id, note) => updateGuest(id, { note })}
                    onRemove={remove}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}

        <form onSubmit={submitGuest} noValidate className="mt-3">
          <label htmlFor={`${uid}-guest`} className="sr-only">
            Guest name
          </label>
          <div className="flex gap-2">
            <input
              id={`${uid}-guest`}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError('');
              }}
              placeholder="Guest name"
              autoComplete="off"
              maxLength={60}
              aria-invalid={nameError ? 'true' : undefined}
              aria-describedby={nameError ? `${uid}-guest-error` : undefined}
              className={field}
            />
            <button type="submit" className={btnSecondary}>
              <Plus aria-hidden="true" className="size-4" strokeWidth={2.5} />
              Add
            </button>
          </div>
          {nameError && (
            <p id={`${uid}-guest-error`} className="mt-1.5 text-sm font-medium text-danger">
              {nameError}
            </p>
          )}
        </form>
      </div>

      <div className="mt-6">
        <label htmlFor={`${uid}-rule`} className={label}>
          House rule
        </label>
        <DraftInput
          id={`${uid}-rule`}
          multiline
          rows={2}
          value={night.houseRule}
          onCommit={setHouseRule}
          maxLength={500}
          placeholder="Loser does the dishes."
          aria-describedby={`${uid}-rule-hint`}
          className={`${field} mt-1.5 h-auto min-h-16 resize-y py-2 leading-snug`}
        />
        <p id={`${uid}-rule-hint`} className={`${hint} mt-1.5`}>
          Saved when you leave the field. Shift + Enter for a new line.
        </p>
      </div>
    </section>
  );
}
