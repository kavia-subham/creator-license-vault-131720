import React from 'react';
import RevenueOverview from '../components/revenue/RevenueOverview';
import EnforcementAlerts from '../components/revenue/EnforcementAlerts';

/**
 * PUBLIC_INTERFACE
 * Revenue page combines KPI overview, revenue trends, and enforcement alerts.
 * Dark-themed visuals with accessible components and placeholder data via stub API.
 */
export default function Revenue() {
  return (
    <div className="page">
      <section className="card" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: '0 0 4px' }}>Revenue & Enforcement</h2>
            <p className="text-dim" style={{ margin: 0 }}>
              Track protected earnings, realized revenue, and active enforcement workflows.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" aria-pressed="true">Overview</button>
            <button className="btn">Reports</button>
            <button className="btn">Export</button>
          </div>
        </div>
      </section>

      <div className="page-grid">
        <RevenueOverview />
        <EnforcementAlerts />
      </div>
    </div>
  );
}
