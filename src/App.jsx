import { useMemo, useState } from 'react';
import { BookOpen, Library, Moon as NightIcon } from 'lucide-react';
import { useGames } from './hooks/useGames';
import { usePlays } from './hooks/usePlays';
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
  const gamesApi = useGames();
  const playsApi = usePlays();
  const { plays } = playsApi;
  const nightApi = useNight();
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useHashTab(TAB_IDS);
  const toast = useToast();
  const [logDialog, setLogDialog] = useState({ open: false, play: null, prefill: null });
  const knownNames = useMemo(() => knownPlayerNames(nightApi.night, plays), [nightApi.night, plays]);

  const openLog = (prefill = null) => setLogDialog({ open: true, play: null, prefill });
  const openEditPlay = (play) => setLogDialog({ open: true, play, prefill: null });
  const closeLog = () => setLogDialog((d) => ({ ...d, open: false }));

  const titleOf = (gameId) => gamesApi.games.find((g) => g.id === gameId)?.title ?? 'that game';

  const savePlay = (values) => {
    if (logDialog.play) {
      playsApi.updatePlay(logDialog.play.id, values);
      toast.show({ message: `Saved the ${titleOf(values.gameId)} play.` });
    } else {
      const play = playsApi.addPlay(values);
      if (play) {
        toast.show({
          message: `Logged ${titleOf(play.gameId)} in the ledger.`,
          actionLabel: 'Undo',
          onAction: () => playsApi.removePlay(play.id),
        });
      }
    }
    closeLog();
  };

  const tabs = [
    { id: 'tonight', label: 'Tonight', icon: NightIcon },
    { id: 'shelf', label: 'Shelf', icon: Library, badge: gamesApi.games.length, badgeLabel: 'games' },
    { id: 'ledger', label: 'Ledger', icon: BookOpen, badge: plays.length || null, badgeLabel: 'plays' },
  ];

  return (
    <div className="min-h-dvh pb-24">
      <header className="sticky top-0 z-30 border-b border-line bg-bg">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between gap-4">
            <Wordmark />
            <div className="flex items-center gap-1">
              <BackupMenu gamesApi={gamesApi} playsApi={playsApi} nightApi={nightApi} toast={toast} />
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
            </div>
          </div>
          <Tabs tabs={tabs} active={tab} onChange={setTab} label="Sections" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8">
        <TabPanel id="tonight" active={tab}>
          <Tonight games={gamesApi.games} plays={plays} nightApi={nightApi} onLog={openLog} toast={toast} />
        </TabPanel>

        <TabPanel id="shelf" active={tab}>
          <Shelf gamesApi={gamesApi} plays={plays} night={nightApi.night} toast={toast} />
        </TabPanel>

        <TabPanel id="ledger" active={tab}>
          <Ledger games={gamesApi.games} playsApi={playsApi} onLog={openLog} onEdit={openEditPlay} toast={toast} />
        </TabPanel>
      </main>

      <LogPlayDialog
        open={logDialog.open}
        play={logDialog.play}
        prefill={logDialog.prefill}
        games={gamesApi.games}
        knownNames={knownNames}
        onSave={savePlay}
        onClose={closeLog}
      />

      <Toast toast={toast.toast} onDismiss={toast.dismiss} />
    </div>
  );
}
