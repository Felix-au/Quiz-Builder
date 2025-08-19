import React from "react";

export type ThemeKey = 'solarizedDuo' | 'gradientMeshPop';

type ThemeContextValue = {
  theme: ThemeKey;
  setTheme: (t: ThemeKey) => void;
  reduceMotion: boolean;
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = React.useState<ThemeKey>(() => {
    if (typeof window === 'undefined') return 'solarizedDuo';
    const saved = localStorage.getItem('appTheme') as ThemeKey | null;
    return saved || 'solarizedDuo';
  });

  React.useEffect(() => {
    try { localStorage.setItem('appTheme', theme); } catch {}
  }, [theme]);

  const [reduceMotion, setReduceMotion] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduceMotion(!!mq.matches);
    apply();
    const handler = (e: MediaQueryListEvent) => setReduceMotion(!!e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const value = React.useMemo(() => ({ theme, setTheme, reduceMotion }), [theme, reduceMotion]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};
