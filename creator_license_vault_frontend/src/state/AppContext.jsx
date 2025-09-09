import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AppContext = createContext(null);

// PUBLIC_INTERFACE
export function AppProvider({ children }) {
  /** Provides global UI state: theme (dark default) and sidebar collapse. */
  const [theme, setTheme] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('clv-theme') : null;
    return saved || 'dark';
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('clv-sidebar') : null;
    return saved === 'true';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('clv-theme', theme); } catch {}
  }, [theme]);

  useEffect(() => {
    try { localStorage.setItem('clv-sidebar', String(sidebarCollapsed)); } catch {}
  }, [sidebarCollapsed]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  const value = useMemo(() => ({
    theme,
    setTheme,
    toggleTheme,
    sidebarCollapsed,
    setSidebarCollapsed,
  }), [theme, sidebarCollapsed]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// PUBLIC_INTERFACE
export function useApp() {
  /** Hook to access global AppContext. */
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
