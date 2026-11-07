import { Moon, Sun } from 'lucide-react';

const NAMES = { dark: 'Cozy Tavern', light: 'Sunlit Porch' };

/** Shows the current theme; switching names the destination for screen readers. */
export default function ThemeToggle({ theme, onToggle }) {
  const next = theme === 'dark' ? 'light' : 'dark';
  const Icon = theme === 'dark' ? Moon : Sun;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${NAMES[next]} (${next} theme)`}
      title={`Switch to ${NAMES[next]}`}
      className="inline-flex h-10 items-center gap-2 rounded-md px-2.5 text-sm font-semibold text-muted transition-colors duration-150 hover:bg-raised hover:text-ink"
    >
      <Icon aria-hidden="true" className="size-[1.125rem]" />
      <span className="hidden sm:inline">{NAMES[theme]}</span>
    </button>
  );
}
