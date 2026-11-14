import { useMemo, useState } from 'react';
import { BookOpen, Library, Moon as NightIcon } from 'lucide-react';
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
import Shelf from './components/shelf/Shelf';
import Tonight from './components/tonight/Tonight';
import Ledger from './components/ledger/Ledger';
import LogPlayDialog from './components/ledger/LogPlayDialog';
import BackupMenu from './components/BackupMenu';
import { knownPlayerNames } from './lib/ledger';

const TAB_IDS = ['tonight', 'shelf', 'ledger'];

function Wordmark() {
  return (
    <h1 className="min-w-0">
      <a
        href="#tonight"
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
  const [tab, setTab] = useHashTab(TAB_IDS);
  const toast = useToast();
  const [logDialog, setLogDialog] = useState({ open: false, play: null, prefill: null });
  const knownNames = useMemo(() => knownPlayerNames(nightApi.night, activity), [nightApi.night, activity]);

  const openLog = (prefill = null) => setLogDialog({ open: true, play: null, prefill });
  const openEditPlay = (play) => setLogDialog({ open: true, play, prefill: null });
  const closeLog = () => setLogDialog((d) => ({ ...d, open: false }));

  const titleOf = (itemId) => items.find((item) => item.id === itemId)?.title ?? 'that item';

  const savePlay = (values) => {
    if (logDialog.play) {
      activityApi.updateActivity(logDialog.play.id, values);
      toast.show({ message: `Saved the ${titleOf(values.itemId)} entry.` });
    } else {
      const entry = activityApi.addActivity(values);
      if (entry) {
        toast.show({
          message: `Logged ${titleOf(entry.itemId)}.`,
          actionLabel: 'Undo',
          onAction: () => activityApi.removeActivity(entry.id),
        });
      }
    }
    closeLog();
  };

  const tabs = [
    { id: 'tonight', label: 'Tonight', icon: NightIcon },
    { id: 'shelf', label: 'Shelf', icon: Library, badge: items.length, badgeLabel: 'items' },
    { id: 'ledger', label: 'Ledger', icon: BookOpen, badge: activity.length || null, badgeLabel: 'log entries' },
  ];

  return (
    <div className="min-h-dvh pb-24">
      <header className="sticky top-0 z-30 border-b border-line bg-bg">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
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

      <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8">
        <TabPanel id="tonight" active={tab}>
          <Tonight games={items} plays={activity} nightApi={nightApi} onLog={openLog} toast={toast} />
        </TabPanel>

        <TabPanel id="shelf" active={tab}>
          <Shelf gamesApi={itemsApi} plays={activity} night={nightApi.night} toast={toast} />
        </TabPanel>

        <TabPanel id="ledger" active={tab}>
          <Ledger games={items} playsApi={activityApi} onLog={openLog} onEdit={openEditPlay} toast={toast} />
        </TabPanel>
      </main>

      <LogPlayDialog
        open={logDialog.open}
        play={logDialog.play}
        prefill={logDialog.prefill}
        games={items}
        knownNames={knownNames}
        onSave={savePlay}
        onClose={closeLog}
      />

      <Toast toast={toast.toast} onDismiss={toast.dismiss} />
    </div>
  );
}
