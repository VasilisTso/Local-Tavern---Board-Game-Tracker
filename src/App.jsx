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
import WheelWidget from './components/WheelWidget';
import RsvpBoard from './components/RsvpBoard';

const TAB_IDS = ['tonight', 'shelf', 'ledger'];

function Wordmark() {
  return (
    <a
      href="#tonight"
      className="flex items-center gap-2.5 rounded-sm text-ink no-underline"
      aria-label="Local Tavern, go to Tonight"
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
  );
}

export default function App() {
  const gamesApi = useGames();
  const { plays } = usePlays();
  const nightApi = useNight();
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useHashTab(TAB_IDS);
  const toast = useToast();

  const tabs = [
    { id: 'tonight', label: 'Tonight', icon: NightIcon },
    { id: 'shelf', label: 'Shelf', icon: Library, badge: gamesApi.games.length },
    { id: 'ledger', label: 'Ledger', icon: BookOpen, badge: plays.length || null },
  ];

  return (
    <div className="min-h-dvh pb-24">
      <header className="sticky top-0 z-30 border-b border-line bg-bg">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between gap-4">
            <Wordmark />
            <div className="flex items-center gap-1">
              {/* Backup menu (export / import / copy summary) lands here in Phase 8. */}
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
            </div>
          </div>
          <Tabs tabs={tabs} active={tab} onChange={setTab} label="Sections" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8">
        <TabPanel id="tonight" active={tab}>
          {/* Interim: replaced by NightPanel + FateWheel in Phase 6. */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <WheelWidget games={gamesApi.games} />
            <RsvpBoard nightApi={nightApi} />
          </div>
        </TabPanel>

        <TabPanel id="shelf" active={tab}>
          <Shelf gamesApi={gamesApi} plays={plays} night={nightApi.night} toast={toast} />
        </TabPanel>

        <TabPanel id="ledger" active={tab}>
          {/* Play log and stats arrive in Phase 7. */}
          <div className="rounded-md border border-dashed border-line-strong px-6 py-12 text-center">
            <h2 className="font-display text-2xl font-bold">The ledger is empty</h2>
            <p className="mx-auto mt-1 max-w-sm text-muted">
              Plays you log after a game night show up here, with who won and what gathers dust.
            </p>
          </div>
        </TabPanel>
      </main>

      <Toast toast={toast.toast} onDismiss={toast.dismiss} />
    </div>
  );
}
