import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, ClipboardCopy, DatabaseBackup, Download, Images, Upload } from 'lucide-react';
import Modal, { ModalActions, ModalHeader } from './Modal';
import { backupFileName, buildBackup, copyText, downloadJson, mergeBackup, nightSummary, parseBackup } from '../lib/backup';
import { exportCovers, importCovers } from '../lib/coverStore';
import { countLabel, formatShortDate } from '../lib/format';
import { btnPrimary, btnSecondary, hint } from './ui';


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
  const coverCount = Object.keys(backup.covers).length;
  const options = [
    {
      id: 'merge',
      label: 'Merge into what is here',
      detail:
        merged.added.items || merged.added.activity || merged.added.locations
          ? `Adds ${countLabel(merged.added.items, 'new item', 'new items')}, ${countLabel(merged.added.activity, 'log entry', 'log entries')} and ${countLabel(merged.added.locations, 'place', 'places')}. The game night plan stays.`
          : 'Nothing new to add: everything in the file is already here.',
    },
    {
      id: 'replace',
      label: 'Replace everything',
      detail: `Your ${countLabel(current.items.length, 'item', 'items')}, ${countLabel(current.activity.length, 'log entry', 'log entries')} and game night plan are swapped for the file's. You can undo right after.`,
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
          <strong className="tabular">{countLabel(backup.items.length, 'item', 'items')}</strong> and{' '}
          <strong className="tabular">{countLabel(backup.activity.length, 'log entry', 'log entries')}</strong>
          {coverCount > 0 && <> with {countLabel(coverCount, 'cover image', 'cover images')}</>}
          {backup.exportedAt && (
            <>
              , saved <time dateTime={backup.exportedAt}>{formatShortDate(backup.exportedAt)}</time>
            </>
          )}
          .
        </p>
        {backup.skipped > 0 && (
          <p className={hint}>{countLabel(backup.skipped, 'damaged entry was', 'damaged entries were')} skipped.</p>
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

/** Header menu: export a JSON backup (optionally with cover images), import one (merge or replace, with undo), copy the night summary. */
export default function BackupMenu({ itemsApi, locationsApi, activityApi, nightApi, toast }) {
  const { items, replaceItems } = itemsApi;
  const { locations, replaceLocations } = locationsApi;
  const { activity, replaceActivity } = activityApi;
  const { night, replaceNight } = nightApi;
  const fileRef = useRef(null);
  const returnFocusRef = useRef(null);
  const titleId = useId();
  const [backup, setBackup] = useState(null);
  const hasCovers = items.some((item) => item.coverId);

  const exportBackup = async (withCovers) => {
    let covers = null;
    if (withCovers) {
      try {
        covers = await exportCovers(items.map((item) => item.coverId));
      } catch {
        covers = null;
      }
    }
    downloadJson(buildBackup({ items, locations, activity, night, covers }), backupFileName());
    const saved = `Saved a backup of ${countLabel(items.length, 'item', 'items')} and ${countLabel(activity.length, 'log entry', 'log entries')}`;
    let images = '';
    if (withCovers) {
      const n = covers ? Object.keys(covers).length : 0;
      images = n ? ` with ${countLabel(n, 'cover image', 'cover images')}` : '. Couldn’t read the cover images, so they were left out';
    }
    toast.show({ message: `${saved}${images}.` });
  };

  const exportPlain = () => exportBackup(false);
  const exportWithCovers = () => exportBackup(true);

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

  const runImport = async (mode, merged) => {
    const before = { items, locations, activity, night };
    if (mode === 'replace') {
      replaceItems(backup.items);
      replaceActivity(backup.activity);
      // Old backups had no places: keep the current ones, plus the shelf their games were put on.
      if (backup.legacy) replaceLocations(merged.locations);
      else if (backup.locations) replaceLocations(backup.locations);
      if (backup.night) replaceNight(backup.night);
    } else {
      replaceItems(merged.items);
      replaceLocations(merged.locations);
      replaceActivity(merged.activity);
    }
    closeImport();
    // Images keep their original ids. Unused ones (after Undo) are pruned on the next start.
    let coverNote = '';
    if (Object.keys(backup.covers).length) {
      try {
        const n = await importCovers(backup.covers);
        coverNote = ` Added ${countLabel(n, 'cover image', 'cover images')}.`;
      } catch {
        coverNote = ' Couldn’t store the cover images, so generated covers are shown instead.';
      }
    }
    const message =
      (mode === 'replace'
        ? `Replaced with ${countLabel(backup.items.length, 'item', 'items')} and ${countLabel(backup.activity.length, 'log entry', 'log entries')}.`
        : `Merged ${countLabel(merged.added.items, 'new item', 'new items')} and ${countLabel(merged.added.activity, 'new log entry', 'new log entries')}.`) + coverNote;
    toast.show({
      message,
      actionLabel: 'Undo',
      duration: 10000,
      onAction: () => {
        replaceItems(before.items);
        replaceLocations(before.locations);
        replaceActivity(before.activity);
        replaceNight(before.night);
      },
    });
  };

  const copySummary = async (button) => {
    const ok = await copyText(nightSummary(night, items));
    button?.focus();
    toast.show({ message: ok ? 'Copied the night summary. Paste it in the group chat.' : 'Couldn’t reach the clipboard.' });
  };

  const menuItems = [
    { id: 'copy', label: 'Copy night summary', detail: 'Date, pick and guests as plain text', icon: ClipboardCopy, onSelect: copySummary },
    { id: 'export', label: 'Export backup', detail: 'Download the library, places and log as JSON', icon: Download, onSelect: exportPlain, separatorBefore: true },
    ...(hasCovers ? [{ id: 'export-covers', label: 'Export with cover images', detail: 'A bigger file that also holds uploaded covers', icon: Images, onSelect: exportWithCovers }] : []),
    { id: 'import', label: 'Import backup…', detail: 'Merge or replace from a backup file', icon: Upload, onSelect: pickFile },
  ];

  return (
    <>
      <Menu label="Backup" items={menuItems} />
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
            current={{ items, locations, activity }}
            onImport={runImport}
            onCancel={closeImport}
          />
        )}
      </Modal>
    </>
  );
}
