import React from 'react';
import { useApp } from '../../state/AppContext';

// PUBLIC_INTERFACE
export default function Topbar() {
  /** Sticky topbar with collapse toggle, theme switch, notifications, and user menu. */
  const { sidebarCollapsed, setSidebarCollapsed, theme, toggleTheme } = useApp();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="icon-btn"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? '➡️' : '⬅️'}
        </button>
        <div className="text-dim" style={{ fontSize: 13 }}>
          {sidebarCollapsed ? 'Menu' : 'Welcome back'}
        </div>
      </div>

      <div className="topbar-actions">
        <button
          className="icon-btn"
          aria-label="Toggle theme"
          onClick={toggleTheme}
          title="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <button className="icon-btn bell-dot" aria-label="Notifications" title="Notifications">
          🔔
        </button>

        <button className="btn" aria-haspopup="menu" title="User menu">
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: 8,
              display: 'inline-block',
              background: 'conic-gradient(from 120deg, var(--primary), var(--secondary), var(--accent))',
              marginRight: 8,
            }}
          />
          <span className="hide-when-collapsed">You</span>
        </button>
      </div>
    </header>
  );
}
