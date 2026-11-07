import { useCallback, useEffect, useState } from 'react';
import { KEYS } from '../lib/storage';

const THEME_COLOR = { dark: '#1a120c', light: '#f6edde' };

function readSaved() {
  try {
    const saved = localStorage.getItem(KEYS.theme);
    return saved === 'light' || saved === 'dark' ? saved : null;
  } catch {
    return null;
  }
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
}

/**
 * "dark" (Cozy Tavern) or "light" (Sunlit Porch). The inline script in index.html applies
 * the same choice before first paint; this hook keeps it in sync afterwards.
 * Follows the OS preference until the user picks a theme explicitly.
 */
export function useTheme() {
  const [theme, setThemeState] = useState(() =>
    document.documentElement.dataset.theme === 'light' ? 'light' : 'dark',
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = (event) => {
      if (!readSaved()) setThemeState(event.matches ? 'light' : 'dark');
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const setTheme = useCallback((next) => {
    try {
      localStorage.setItem(KEYS.theme, next);
    } catch {
      // storage blocked: theme still applies for this session
    }
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => setTheme(theme === 'dark' ? 'light' : 'dark'), [theme, setTheme]);

  return { theme, setTheme, toggleTheme };
}
