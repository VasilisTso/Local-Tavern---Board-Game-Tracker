import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, ClipboardCopy, DatabaseBackup, Download, Upload } from 'lucide-react';
import Modal, { ModalActions, ModalHeader } from './Modal';
import { backupFileName, buildBackup, copyText, downloadJson, mergeBackup, nightSummary, parseBackup } from '../lib/backup';
import { formatShortDate } from '../lib/format';
import { btnPrimary, btnSecondary, hint } from './ui';

const count = (n, one, many) => `${n} ${n === 1 ? one : many}`;

function focusItem(menu, index) {
  const nodes = menu?.querySelectorAll('[role="menuitem"]');
  if (!nodes?.length) return;
  nodes[(index + nodes.length) % nodes.length].focus();
}

/** Menu button pattern: arrows move, Home/End jump, Esc and Tab close, focus returns to the button. */
function Menu({ label, items }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const id = useId();

  useEffect(() => {
    if (!open) return undefined;
    focusItem(menuRef.current, 0);
    const onPointerDown = (event) => {
      if (!menuRef.current?.contains(event.target) && !buttonRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  };

  const onMenuKeyDown = (event) => {
    const nodes = [...menuRef.current.querySelectorAll('[role="menuitem"]')];
    const index = nodes.indexOf(document.activeElement);
    if (event.key === 'ArrowDown') focusItem(menuRef.current, index + 1);
    else if (event.key === 'ArrowUp') focusItem(menuRef.current, index - 1);
    else if (event.key === 'Home') focusItem(menuRef.current, 0);
    else if (event.key === 'End') focusItem(menuRef.current, nodes.length - 1);
    else if (event.key === 'Escape') close();
    else if (event.key === 'Tab') close(false);
    else return;
    if (event.key !== 'Tab') event.preventDefault();
  };

  const onButtonKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        id={`${id}-button`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? `${id}-menu` : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onButtonKeyDown}
        className="inline-flex h-10 items-center gap-1.5 rounded-md px-2.5 text-sm font-semibold text-muted transition-colors duration-150 hover:bg-raised hover:text-ink aria-expanded:bg-raised aria-expanded:text-ink"
      >
        <DatabaseBackup aria-hidden="true" className="size-[1.125rem]" />
        <span className="max-sm:sr-only">{label}</span>
        <ChevronDown aria-hidden="true" className="size-4 max-sm:hidden" />
      </button>
      {open && (
        <ul
          ref={menuRef}
          id={`${id}-menu`}
          role="menu"
          aria-labelledby={`${id}-button`}
          onKeyDown={onMenuKeyDown}
          className="absolute right-0 z-40 mt-1.5 w-64 max-w-[calc(100vw-2rem)] rounded-md border border-line-strong bg-surface p-1.5 shadow-[0_12px_32px_-12px_oklch(0.1_0.02_55/0.55)]"
        >
          {items.map(({ id: itemId, label: itemLabel, detail, icon: Icon, onSelect, separatorBefore }) => (
            <li key={itemId} role="none" className={separatorBefore ? 'mt-1 border-t border-line pt-1' : ''}>
              <button
                type="button"
                role="menuitem"
                tabIndex={-1}
                onClick={() => {
                  close();
                  onSelect(buttonRef.current);
                }}
                className="flex min-h-11 w-full items-start gap-2.5 rounded-sm px-2 py-2 text-left text-sm text-ink hover:bg-raised focus-visible:bg-raised"
              >
                <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted" />
                <span className="min-w-0">
                  <span className="block font-semibold">{itemLabel}</span>
                  {detail && <span className="block text-xs text-muted">{detail}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ImportForm({ backup, current, onImport, onCancel, titleId }) {
  const [mode, setMode] = useState('merge');
  const uid = useId();
  const merged = mergeBackup(current, backup);
  const options = [
    {
      id: 'merge',
      label: 'Merge into what is here',
      detail:
        merged.added.games || merged.added.plays
          ? `Adds ${count(merged.added.games, 'new game', 'new games')} and ${count(merged.added.plays, 'new play', 'new plays')}. Tonight's plan stays.`
          : 'Nothing new to add: everything in the file is already here.',
    },
    {
      id: 'replace',
      label: 'Replace everything',
      detail: `Your ${count(current.games.length, 'game', 'games')}, ${count(current.plays.length, 'play', 'plays')} and tonight's plan are swapped for the file's. You can undo right after.`,
    },
  ];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onImport(mode, merged);
      }}
      className="flex max-h-[inherit] flex-col"
    >
      <ModalHeader id={titleId} title="Import backup" onClose={onCancel} />
      <div className="space-y-4 overflow-y-auto px-5 py-4">
        <p className="text-ink">
          The file holds{' '}
          <strong className="tabular">{count(backup.games.length, 'game', 'games')}</strong> and{' '}
          <strong className="tabular">{count(backup.plays.length, 'play', 'plays')}</strong>
          {backup.exportedAt && (
            <>
              , saved <time dateTime={backup.exportedAt}>{formatShortDate(backup.exportedAt)}</time>
            </>
          )}
          .
        </p>
        {backup.skipped > 0 && (
          <p className={hint}>{count(backup.skipped, 'damaged entry was', 'damaged entries were')} skipped.</p>
        )}
        <fieldset>
          <legend className="sr-only">How to import</legend>
          <div className="space-y-2">
            {options.map((option) => (
              <label
                key={option.id}
                className={`flex cursor-pointer gap-3 rounded-md border p-3 transition-colors duration-150 ${
                  mode === option.id ? 'border-accent bg-raised' : 'border-line hover:border-line-strong'
                }`}
              >
                <input
                  type="radio"
                  name={`${uid}-mode`}
                  value={option.id}
                  checked={mode === option.id}
                  onChange={() => setMode(option.id)}
                  data-autofocus={mode === option.id ? '' : undefined}
                  className="mt-1 size-4 shrink-0"
                />
                <span>
                  <span className="block font-semibold text-ink">{option.label}</span>
                  <span className="mt-0.5 block text-sm text-muted">{option.detail}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <ModalActions>
        <button type="button" onClick={onCancel} className={btnSecondary}>
          Cancel
        </button>
        <button type="submit" className={btnPrimary}>
          <Upload aria-hidden="true" className="size-4" />
          {mode === 'replace' ? 'Replace and import' : 'Merge'}
        </button>
      </ModalActions>
    </form>
  );
}

/** Header menu: export a JSON backup, import one (merge or replace, with undo), copy tonight's summary. */
export default function BackupMenu({ gamesApi, playsApi, nightApi, toast }) {
  const { games, replaceGames } = gamesApi;
  const { plays, replacePlays } = playsApi;
  const { night, replaceNight } = nightApi;
  const fileRef = useRef(null);
  const returnFocusRef = useRef(null);
  const titleId = useId();
  const [backup, setBackup] = useState(null);

  const exportBackup = () => {
    downloadJson(buildBackup({ games, plays, night }), backupFileName());
    toast.show({ message: `Saved a backup of ${count(games.length, 'game', 'games')} and ${count(plays.length, 'play', 'plays')}.` });
  };

  const pickFile = (button) => {
    returnFocusRef.current = button;
    fileRef.current?.click();
  };

  const onFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow picking the same file again
    if (!file) return;
    const result = parseBackup(await file.text());
    if (!result.ok) {
      toast.show({ message: `Couldn’t import ${file.name}. ${result.error}` });
      return;
    }
    setBackup(result.data);
  };

  const closeImport = () => {
    setBackup(null);
    returnFocusRef.current?.focus();
  };

  const runImport = (mode, merged) => {
    const before = { games, plays, night };
    if (mode === 'replace') {
      replaceGames(backup.games);
      replacePlays(backup.plays);
      if (backup.night) replaceNight(backup.night);
    } else {
      replaceGames(merged.games);
      replacePlays(merged.plays);
    }
    closeImport();
    const message =
      mode === 'replace'
        ? `Replaced with ${count(backup.games.length, 'game', 'games')} and ${count(backup.plays.length, 'play', 'plays')}.`
        : `Merged ${count(merged.added.games, 'new game', 'new games')} and ${count(merged.added.plays, 'new play', 'new plays')}.`;
    toast.show({
      message,
      actionLabel: 'Undo',
      duration: 10000,
      onAction: () => {
        replaceGames(before.games);
        replacePlays(before.plays);
        replaceNight(before.night);
      },
    });
  };

  const copySummary = async (button) => {
    const ok = await copyText(nightSummary(night, games));
    button?.focus();
    toast.show({ message: ok ? 'Copied tonight’s summary. Paste it in the group chat.' : 'Couldn’t reach the clipboard.' });
  };

  const items = [
    { id: 'copy', label: 'Copy night summary', detail: 'Date, pick and guests as plain text', icon: ClipboardCopy, onSelect: copySummary },
    { id: 'export', label: 'Export backup', detail: 'Download games, plays and tonight as JSON', icon: Download, onSelect: exportBackup, separatorBefore: true },
    { id: 'import', label: 'Import backup…', detail: 'Merge or replace from a backup file', icon: Upload, onSelect: pickFile },
  ];

  return (
    <>
      <Menu label="Backup" items={items} />
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        onChange={onFile}
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
      />
      <Modal open={!!backup} onClose={closeImport} labelledBy={titleId}>
        {backup && (
          <ImportForm
            titleId={titleId}
            backup={backup}
            current={{ games, plays }}
            onImport={runImport}
            onCancel={closeImport}
          />
        )}
      </Modal>
    </>
  );
}
