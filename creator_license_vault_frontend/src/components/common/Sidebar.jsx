import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../../state/AppContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/verification', label: 'Verification', icon: '🧾' },
  { to: '/licensing', label: 'Licensing', icon: '📜' },
  { to: '/documents', label: 'Documents', icon: '📂' },
  { to: '/monitoring', label: 'Monitoring', icon: '🛰️' },
  { to: '/revenue', label: 'Revenue', icon: '💸' },
  { to: '/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

// PUBLIC_INTERFACE
export default function Sidebar() {
  /** Collapsible sidebar with elegant animations and vivid accents. */
  const { sidebarCollapsed } = useApp();
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        <div className="brand">
          <div className="brand-logo" />
          <div className={`brand-title hide-when-collapsed`}>Creator License Vault</div>
        </div>

        <div className="nav">
          <div className="nav-section-title hide-when-collapsed">Main</div>
          {navItems.map(item => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive: linkActive }) =>
                  ['nav-item', (isActive || linkActive) ? 'active' : ''].join(' ')
                }
              >
                <span className="nav-icon" aria-hidden>{item.icon}</span>
                <span className="hide-when-collapsed">{item.label}</span>
                {sidebarCollapsed && <span className="tip">{item.label}</span>}
              </NavLink>
            );
          })}
        </div>

        <div className="sidebar-footer">
          <div className="text-dim hide-when-collapsed" style={{ fontSize: 12 }}>
            v0.1 • secure by design
          </div>
        </div>
      </div>
    </aside>
  );
}
