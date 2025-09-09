import React from 'react';

/**
 * PUBLIC_INTERFACE
 * VerificationStatusCard renders a single verification job status with progress,
 * confirmations, explorer links, and actions. Works in full and compact modes.
 * Props:
 * - job: Verification job object from verificationApi
 * - compact?: boolean
 * - onFocus?: fn()
 * - onCancel?: fn()
 */
export default function VerificationStatusCard({ job, compact = false, onFocus, onCancel }) {
  if (!job) return null;
  const tone = getTone(job.status);

  return (
    <article
      className="card"
      onClick={onFocus}
      style={{
        margin: 0,
        borderColor: 'var(--border)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)), var(--bg-elev-1)',
        transition: 'transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast)',
        cursor: onFocus ? 'pointer' : 'default'
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'grid' }}>
          <strong style={{ lineHeight: 1.2 }}>{job.title}</strong>
          <span className="text-dim" style={{ fontSize: 12 }}>
            {job.sourceType === 'file' ? 'File' : 'URL'} • Created {formatTime(job.createdAt)}
          </span>
        </div>
        <StatusPill status={job.status} />
      </header>

      <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
        <ProgressBar
          status={job.status}
          progress={job.progress}
          tone={tone}
        />

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Meta label="Hash" value={job.assetHash?.slice(0, 10) + '…' || '—'} copyable={job.assetHash} />
          <Meta label="Tx" value={job.txHash ? shorten(job.txHash) : '—'} copyable={job.txHash} />
          <Meta label="Confirmations" value={String(job.confirmations ?? 0)} />
          <Meta label="Network" value={job.network || 'Testnet'} />
        </div>

        {job.explorerUrl && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <a className="btn" href={job.explorerUrl} target="_blank" rel="noreferrer">🔗 View on Explorer</a>
            {job.txHash && (
              <a className="btn" href={`${job.explorerBase}/tx/${job.txHash}`} target="_blank" rel="noreferrer">🧾 Transaction</a>
            )}
          </div>
        )}

        {!compact && job.message && (
          <div className="text-dim" style={{ fontSize: 14 }}>{job.message}</div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          {job.status === 'pending' || job.status === 'onchain' ? (
            <button className="btn" onClick={(e) => { e.stopPropagation(); onCancel?.(job); }}>
              ✖ Cancel
            </button>
          ) : null}
          {job.status === 'failed' && job.error && (
            <span className="text-dim" style={{ color: '#ff7670' }}>Error: {job.error}</span>
          )}
        </div>
      </div>
    </article>
  );
}

function StatusPill({ status }) {
  const color = getTone(status);
  return (
    <span style={{
      fontSize: 12,
      padding: '6px 10px',
      borderRadius: 999,
      border: '1px solid var(--border)',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
      boxShadow: `0 0 0 2px rgba(255,255,255,0.02), 0 4px 10px ${color}44`,
      color
    }}>
      {status}
    </span>
  );
}

function ProgressBar({ status, progress, tone }) {
  const pct = Math.max(0, Math.min(100, Math.round(progress || 0)));
  return (
    <div aria-label={`Progress ${pct}%`} style={{
      position: 'relative',
      height: 10,
      borderRadius: 8,
      background: 'var(--bg-elev-0)',
      border: '1px solid var(--border)',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(90deg, rgba(108,99,255,0.14), rgba(68,207,203,0.12))',
        opacity: 0.35
      }} />
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: `${pct}%`,
        background: `linear-gradient(135deg, ${tone}, #ffffff22)`,
        transition: 'width var(--transition-slow)'
      }} />
    </div>
  );
}

function Meta({ label, value, copyable }) {
  const copy = () => {
    if (!copyable) return;
    try {
      navigator.clipboard.writeText(copyable);
    } catch {}
  };
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '8px 10px',
      borderRadius: 10,
      border: '1px solid var(--border)',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.0))',
      fontSize: 12
    }}>
      <span className="text-dim" style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</span>
      <span>{value}</span>
      {copyable ? <button className="btn" onClick={copy} title="Copy" style={{ padding: '4px 8px' }}>📋</button> : null}
    </div>
  );
}

function getTone(status) {
  switch (status) {
    case 'pending': return 'var(--primary)';
    case 'onchain': return 'var(--accent)';
    case 'success': return '#5BD28C';
    case 'failed': return '#ff7670';
    default: return 'var(--primary)';
  }
}

function formatTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

function shorten(v, left = 6, right = 4) {
  if (!v) return v;
  if (v.length <= left + right + 3) return v;
  return `${v.slice(0, left)}…${v.slice(-right)}`;
}
