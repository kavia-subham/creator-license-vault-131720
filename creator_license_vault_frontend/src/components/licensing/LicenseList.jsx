import React from 'react';

/**
 * PUBLIC_INTERFACE
 * LicenseList renders a grid of license cards with status highlighting, quick facts,
 * and inline actions to view details, edit, or revoke.
 */
export default function LicenseList({ loading, items, onOpenDetail, onEdit, onRevoke }) {
  if (loading) {
    return (
      <section className="card" aria-busy="true">
        <div className="text-dim">Loading licenses…</div>
      </section>
    );
  }

  if (!items || items.length === 0) {
    return (
      <section className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 20 }}>🗂️</div>
          <div>
            <div style={{ fontWeight: 700 }}>No licenses found</div>
            <div className="text-dim" style={{ fontSize: 14 }}>Create a license to get started.</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="card" style={{ padding: 0 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 14,
        padding: 16
      }}>
        {items.map((lic) => (
          <article
            key={lic.id}
            className="card"
            style={{
              margin: 0,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)), var(--bg-elev-1)',
              borderColor: 'var(--border)',
              cursor: 'pointer'
            }}
            onClick={() => onOpenDetail(lic)}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>{lic.title}</h3>
              <StatusPill status={lic.status} />
            </div>
            <div className="text-dim" style={{ fontSize: 13, marginTop: 6 }}>
              {lic.assetName} • Licensee: {lic.licensee}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
              <InfoBlock label="Usage" value={lic.usageRights || 'Custom'} />
              <InfoBlock label="Territory" value={lic.territory || 'Worldwide'} />
              <InfoBlock label="Start" value={lic.startDate || '-'} />
              <InfoBlock label="End" value={lic.endDate || 'Perpetual'} />
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button
                className="btn"
                onClick={(e) => { e.stopPropagation(); onOpenDetail(lic); }}
                title="View details"
              >
                👁️ View
              </button>
              <button
                className="btn"
                onClick={(e) => { e.stopPropagation(); onEdit(lic); }}
                title="Edit license"
              >
                ✏️ Edit
              </button>
              {lic.status !== 'revoked' && (
                <button
                  className="btn"
                  onClick={(e) => { e.stopPropagation(); onRevoke(lic); }}
                  title="Revoke license"
                >
                  ⛔ Revoke
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '10px 12px',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0))'
    }}>
      <div className="text-dim" style={{ fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 14, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function StatusPill({ status }) {
  const tone = status === 'active' ? 'var(--accent)'
    : status === 'expired' ? 'var(--secondary)'
    : status === 'revoked' ? '#ff7670'
    : 'var(--primary)';
  return (
    <span style={{
      fontSize: 12,
      padding: '6px 10px',
      borderRadius: 999,
      border: '1px solid var(--border)',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
      boxShadow: `0 0 0 2px rgba(255,255,255,0.02), 0 4px 10px ${tone}33`,
      color: tone
    }}>
      {status}
    </span>
  );
}
