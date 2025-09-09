import React from 'react';

/**
 * PUBLIC_INTERFACE
 * LicenseDetailDrawer shows a rich, animated drawer with license metadata, quick actions,
 * and an overview of key terms. Meant for a fast, delightful review experience.
 */
export default function LicenseDetailDrawer({ open, license, onClose, onEdit, onRevoke, onDelete }) {
  if (!license) return null;

  return (
    <>
      <div
        aria-hidden={!open}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: open ? 'rgba(0,0,0,0.45)' : 'transparent',
          backdropFilter: open ? 'blur(2px)' : 'none', opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity var(--transition-slow), backdrop-filter var(--transition-slow)', zIndex: 20
        }}
      />
      <section
        role="dialog"
        aria-label="License details"
        aria-modal="true"
        style={{
          position: 'fixed', top: 0, bottom: 0, right: 0, width: 'min(520px, 92vw)',
          background: 'var(--bg-elev-1)', borderLeft: '1px solid var(--border)', boxShadow: 'var(--shadow)',
          transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform var(--transition-slow)',
          zIndex: 21, display: 'grid', gridTemplateRows: 'auto 1fr auto'
        }}
      >
        <header style={{ padding: 16, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'grid' }}>
            <strong>{license.title}</strong>
            <span className="text-dim" style={{ fontSize: 12 }}>{license.assetName} • Licensee: {license.licensee}</span>
          </div>
          <button className="btn" onClick={onClose} title="Close">✖</button>
        </header>

        <div style={{ padding: 16, overflowY: 'auto', display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Pill label="Status" value={license.status} />
            <Pill label="Usage" value={license.usageRights || 'Custom'} />
            <Pill label="Territory" value={license.territory || 'Worldwide'} />
            <Pill label="Royalty" value={license.royalty || '—'} />
            <Pill label="Exclusivity" value={license.exclusivity || '—'} />
            <Pill label="Duration" value={license.duration || '—'} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <KeyVal k="Start Date" v={license.startDate || '—'} />
            <KeyVal k="End Date" v={license.endDate || 'Perpetual'} />
          </div>

          <div style={{ border: '1px solid var(--border)', borderRadius: 14, padding: 12, background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0))' }}>
            <div className="text-dim" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6 }}>Notes</div>
            <div style={{ marginTop: 6 }}>{license.notes || <span className="text-dim">No additional notes.</span>}</div>
          </div>
        </div>

        <footer style={{ padding: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="text-dim" style={{ fontSize: 12 }}>
            ID: {license.id}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={onEdit} title="Edit">✏️ Edit</button>
            {license.status !== 'revoked' && (
              <button className="btn" onClick={onRevoke} title="Revoke">⛔ Revoke</button>
            )}
            <button className="btn" onClick={onDelete} title="Delete">🗑️ Delete</button>
          </div>
        </footer>
      </section>
    </>
  );
}

function Pill({ label, value }) {
  return (
    <span style={{
      fontSize: 12,
      padding: '6px 10px',
      borderRadius: 999,
      border: '1px solid var(--border)',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
    }}>
      <span className="text-dim" style={{ marginRight: 6 }}>{label}:</span> {value}
    </span>
  );
}

function KeyVal({ k, v }) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}>
      <div className="text-dim" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6 }}>{k}</div>
      <div style={{ marginTop: 4 }}>{v}</div>
    </div>
  );
}
