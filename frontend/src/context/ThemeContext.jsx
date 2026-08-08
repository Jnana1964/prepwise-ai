import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

// Real theme state, persisted to localStorage. DashboardLayout applies the
// resulting `theme` value as a data-theme attribute on its own root
// wrapper (not <html>), so this only ever affects the authenticated app
// shell - the public Homepage/Login/Signup pages stay the original dark
// design no matter what's stored here.
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('pw_theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('pw_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
