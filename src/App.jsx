import { useMemo, useState } from 'react';
import { BookOpen, Dices, Library as LibraryIcon } from 'lucide-react';
import { useItems } from './hooks/useItems';
import { useLocations } from './hooks/useLocations';
import { useActivity } from './hooks/useActivity';
import { useNight } from './hooks/useNight';
import { useTheme } from './hooks/useTheme';
import { useHashTab } from './hooks/useHashTab';
import { useToast } from './hooks/useToast';
import Tabs, { TabPanel } from './components/Tabs';
import Toast from './components/Toast';
import ThemeToggle from './components/ThemeToggle';
import Library from './components/library/Library';
import Pick from './components/pick/Pick';
import Log from './components/log/Log';
import LogDialog from './components/log/LogDialog';
import BackupMenu from './components/BackupMenu';
import { knownPlayerNames } from './lib/log';
import { activityVerb, itemPatchForEntry } from './lib/kinds';

const TAB_IDS = ['library', 'pick', 'log'];
/** Hashes from earlier versions. */
const TAB_ALIASES = { shelf: 'library', tonight: 'pick', ledger: 'log' };

function Wordmark() {
  return (
    <h1 className="min-w-0">
      <a
        href="#library"
        className="flex items-center gap-2.5 rounded-sm pr-1 text-ink no-underline"
      >
        <svg viewBox="0 0 64 64" aria-hidden="true" className="size-8 shrink-0">
          <rect width="64" height="64" rx="12" className="fill-raised" />
          <rect x="12" y="12" width="40" height="40" rx="7" fill="none" strokeWidth="3.5" className="stroke-accent" />
          <circle cx="23" cy="23" r="4" className="fill-accent" />
          <circle cx="32" cy="32" r="4" className="fill-accent" />
          <circle cx="41" cy="41" r="4" className="fill-accent" />
        </svg>
        <span className="font-display text-2xl font-bold tracking-tight">Local Tavern</span>
      </a>
    </h1>
  );
}

export default function App() {
  const itemsApi = useItems();
  const locationsApi = useLocations();
  const activityApi = useActivity();
  const { items } = itemsApi;
  const { activity } = activityApi;
  const nightApi = useNight();
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useHashTab(TAB_IDS, TAB_ALIASES);
  const toast = useToast();
  const [logDialog, setLogDialog] = useState({ open: false, entry: null, prefill: null });
  const knownNames = useMemo(() => knownPlayerNames(nightApi.night, activity), [nightApi.night, activity]);

  const openLog = (prefill = null) => setLogDialog({ open: true, entry: null, prefill });
  const openEditEntry = (entry) => setLogDialog({ open: true, entry, prefill: null });
  const closeLog = () => setLogDialog((d) => ({ ...d, open: false }));

  const saveEntry = (values) => {
    const item = items.find((i) => i.id === values.itemId);
    const title = item?.title ?? 'that item';
    if (logDialog.entry) {
      activityApi.updateActivity(logDialog.entry.id, values);
      toast.show({ message: `Saved the ${title} entry.` });
      closeLog();
      return;
    }
    const entry = activityApi.addActivity(values);
    if (!entry) return;
    // A new entry can move the item along: started puts it in progress, finished marks it done.
    const patch = itemPatchForEntry(item, entry);
    const before = patch && Object.fromEntries(Object.keys(patch).map((key) => [key, item[key]]));
    if (patch) itemsApi.updateItem(item.id, patch);
    // "Finished X" and "Started X" already say where it moved; a first session needs the hint.
    const moved = patch?.status === 'active' && entry.type === 'session' ? ` It's on your Now shelf.` : '';
    toast.show({
      message: `${activityVerb(item?.kind, entry.type)} ${title}. Logged.${moved}`,
      actionLabel: 'Undo',
      onAction: () => {
        activityApi.removeActivity(entry.id);
        if (patch) itemsApi.updateItem(item.id, before);
      },
    });
    closeLog();
  };

  const tabs = [
    { id: 'library', label: 'Library', icon: LibraryIcon, badge: items.length, badgeLabel: 'items' },
    { id: 'pick', label: 'Pick', icon: Dices },
    { id: 'log', label: 'Log', icon: BookOpen, badge: activity.length || null, badgeLabel: 'log entries' },
  ];

  return (
    <div className="min-h-dvh pb-24">
      <header className="sticky top-0 z-30 border-b border-line bg-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between gap-4">
            <Wordmark />
            <div className="flex items-center gap-1">
              <BackupMenu
                itemsApi={itemsApi}
                locationsApi={locationsApi}
                activityApi={activityApi}
                nightApi={nightApi}
                toast={toast}
              />
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
            </div>
          </div>
          <Tabs tabs={tabs} active={tab} onChange={setTab} label="Sections" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8">
        <TabPanel id="library" active={tab}>
          <Library itemsApi={itemsApi} locationsApi={locationsApi} activity={activity} onLog={openLog} toast={toast} />
        </TabPanel>

        <TabPanel id="pick" active={tab}>
          <Pick
            items={items}
            activity={activity}
            locations={locationsApi.locations}
            itemsApi={itemsApi}
            nightApi={nightApi}
            onLog={openLog}
            toast={toast}
          />
        </TabPanel>

        <TabPanel id="log" active={tab}>
          <Log items={items} activityApi={activityApi} onLog={openLog} onEdit={openEditEntry} toast={toast} />
        </TabPanel>
      </main>

      <LogDialog
        open={logDialog.open}
        entry={logDialog.entry}
        prefill={logDialog.prefill}
        items={items}
        knownNames={knownNames}
        onSave={saveEntry}
        onClose={closeLog}
      />

      <Toast toast={toast.toast} onDismiss={toast.dismiss} />
    </div>
  );
}
