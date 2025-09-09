import React, { useEffect, useMemo, useState } from 'react';
import revenueApi from '../../services/api/revenueApi';

/**
 * PUBLIC_INTERFACE
 * EnforcementAlerts renders an animated, filterable list of enforcement alerts:
 * - Quick filters: All, DMCA, Payment, Settlement
 * - Search box
 * - Actions: mark read, resolve
 */
export default function EnforcementAlerts() {
  const [type, setType] = useState('all'); // all|dmca|payment|settlement
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  const reload = async () => {
    setLoading(true);
    const list = await revenueApi.listAlerts({ type, query });
    setAlerts(list);
    setLoading(false);
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, query]);

  const grouped = useMemo(() => {
    const groups = {
      open: alerts.filter((a) => a.status !== 'resolved'),
      resolved: alerts.filter((a) => a.status === 'resolved'),
    };
    return groups;
  }, [alerts]);

  const markRead = async (id) => {
    const updated = await revenueApi.markAlertRead(id);
    if (updated) {
      setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    }
  };

  const resolve = async (id) => {
    const updated = await revenueApi.resolveAlert(id);
    if (updated) {
      setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    }
  };

  return (
    <section className="card" aria-label="Enforcement alerts" style={{ overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: '0 0 4px' }}>Enforcement alerts</h3>
          <p className="text-dim" style={{ margin: 0 }}>
            Track DMCA notices, payments, and settlements. Take quick action.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => setType('all')} aria-pressed={type === 'all'}>All</button>
          <button className="btn" onClick={() => setType('dmca')} aria-pressed={type === 'dmca'}>DMCA</button>
          <button className="btn" onClick={() => setType('payment')} aria-pressed={type === 'payment'}>Payments</button>
          <button className="btn" onClick={() => setType('settlement')} aria-pressed={type === 'settlement'}>Settlements</button>
        </div>
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <input
          aria-label="Search alerts"
          placeholder="Search by title, counterparty, status..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: 1,
            padding: '12px 14px',
            borderRadius: 12,
            background: 'var(--bg-elev-1)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
          }}
        />
        <button className="btn" onClick={() => setQuery('')}>Clear</button>
      </div>

      {loading ? (
        <div className="text-dim" style={{ marginTop: 12 }}>Loading alerts…</div>
      ) : alerts.length === 0 ? (
        <div className="text-dim" style={{ marginTop: 12 }}>No alerts found for the current filter.</div>
      ) : (
        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          {grouped.open.length > 0 && (
            <>
              <SectionTitle title="Open" />
              {grouped.open.map((a, idx) => (
                <AlertRow
                  key={a.id}
                  alert={a}
                  style={{ animationDelay: `${idx * 40}ms` }}
                  onRead={() => markRead(a.id)}
                  onResolve={() => resolve(a.id)}
                />
              ))}
            </>
          )}
          {grouped.resolved.length > 0 && (
            <>
              <SectionTitle title="Resolved" />
              {grouped.resolved.map((a, idx) => (
                <AlertRow
                  key={a.id}
                  alert={a}
                  style={{ animationDelay: `${idx * 40}ms` }}
                  onRead={() => markRead(a.id)}
                  onResolve={() => resolve(a.id)}
                />
              ))}
            </>
          )}
        </div>
      )}
    </section>
  );
}

function SectionTitle({ title }) {
  return (
    <div className="text-dim" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 4 }}>
      {title}
    </div>
  );
}

function AlertRow({ alert, onRead, onResolve, style }) {
  const tone = getTone(alert.type);
  const icon = getIcon(alert.type);

  return (
    <article
      className="card"
      style={{
        margin: 0,
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: 12,
        alignItems: 'center',
        borderColor: 'var(--border)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)), var(--bg-elev-1)',
        transform: 'translateY(6px)',
        opacity: 0,
        animation: 'alertIn 600ms var(--transition-slow) forwards',
        ...style
      }}
    >
      <div
        aria-hidden
        className="nav-icon"
        style={{
          width: 40,
          height: 40,
          borderColor: 'var(--border)',
          color: tone,
          display: 'grid',
          placeItems: 'center'
        }}
        title={alert.type}
      >
        {icon}
      </div>

      <div style={{ display: 'grid', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <strong>{alert.title}</strong>
          <StatusPill status={alert.status} />
          {!alert.read && <span className="badge" style={{ borderColor: 'var(--border)' }}>new</span>}
        </div>
        <div className="text-dim" style={{ fontSize: 13 }}>
          {alert.counterparty} • {formatAmount(alert.amount)} • {new Date(alert.createdAt).toLocaleString()}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {!alert.read && (
          <button className="btn" onClick={onRead} title="Mark as read">
            ✅ Read
          </button>
        )}
        {alert.status !== 'resolved' && (
          <button className="btn" onClick={onResolve} title="Resolve">
            ✔️ Resolve
          </button>
        )}
      </div>
    </article>
  );
}

function StatusPill({ status }) {
  const color =
    status === 'resolved' ? '#5BD28C' : status === 'open' ? 'var(--secondary)' : 'var(--primary)';
  return (
    <span
      style={{
        fontSize: 12,
        padding: '6px 10px',
        borderRadius: 999,
        border: '1px solid var(--border)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
        boxShadow: `0 0 0 2px rgba(255,255,255,0.02), 0 4px 10px ${color}44`,
        color
      }}
    >
      {status}
    </span>
  );
}

function getTone(type) {
  switch (type) {
    case 'dmca':
      return 'var(--secondary)';
    case 'payment':
      return '#5BD28C';
    case 'settlement':
      return '#FFC46B';
    default:
      return 'var(--primary)';
  }
}

function getIcon(type) {
  switch (type) {
    case 'dmca':
      return '⚖️';
    case 'payment':
      return '💳';
    case 'settlement':
      return '🤝';
    default:
      return '📣';
  }
}

function formatAmount(v) {
  if (!v) return '$0';
  return '$' + Intl.NumberFormat().format(v);
}

// keyframes (scoped via style tag injection)
const styleNode = (() => {
  const id = 'clv-alerts-anim';
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const el = document.createElement('style');
    el.id = id;
    el.textContent = `
@keyframes alertIn { to { transform: translateY(0); opacity: 1; } }
`;
    document.head.appendChild(el);
  }
  return null;
})();
