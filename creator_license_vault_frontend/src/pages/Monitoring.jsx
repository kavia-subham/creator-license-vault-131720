import React, { useMemo } from 'react';
import MonitoringCharts from '../components/monitoring/Charts';

/**
 * PUBLIC_INTERFACE
 * Monitoring page provides a dark-themed dashboard of content monitoring analytics:
 * - KPI counters (day/week/month)
 * - Trends over time (area + line)
 * - Platform/license type breakdown (donut)
 */
export default function Monitoring() {
  // In a future iteration, fetch from API. For now, allow Charts to self-generate demo data,
  // but we also show how props could be passed by memoizing a structure (left commented).
  const data = useMemo(() => null, []);

  return (
    <div className="page">
      <section className="card" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: '0 0 4px' }}>Content Monitoring</h2>
            <p className="text-dim" style={{ margin: 0 }}>
              Live analytics for detected matches across the web. Stay ahead with trends and breakdowns.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" aria-pressed="true">All</button>
            <button className="btn">Web</button>
            <button className="btn">Marketplace</button>
            <button className="btn">Social</button>
          </div>
        </div>
      </section>

      <MonitoringCharts data={data || undefined} />
    </div>
  );
}
