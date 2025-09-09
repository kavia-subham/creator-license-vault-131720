import React from 'react';
import Sidebar from '../components/common/Sidebar';
import Topbar from '../components/common/Topbar';
import { useApp } from '../state/AppContext';

// PUBLIC_INTERFACE
export default function MainLayout({ children }) {
  /** Main layout grid with animated collapsible sidebar and sticky topbar. */
  const { sidebarCollapsed } = useApp();

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <Sidebar />
      <Topbar />
      <main className="content">{children}</main>
    </div>
  );
}
