import React, { useEffect, useMemo, useState } from 'react';
import docsApi from '../../services/api/docsApi';

const TYPE_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'proof', label: 'Proofs' },
  { key: 'notarized_hash', label: 'Notarized Hashes' },
  { key: 'certificate', label: 'Certificates' },
  { key: 'agreement', label: 'Agreements' },
];

/**
 * PUBLIC_INTERFACE
 * DocumentsList renders a responsive, dark-themed grid of legal documents with:
 * - Filters by type and search
 * - Animated secure download buttons
 * - Status indicators (valid, expired, revoked, pending)
 */
export default function DocumentsList() {
  const [type, setType] = useState('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState([]);
  const [downloading, setDownloading] = useState({}); // { id: boolean }

  const reload = async () => {
    setLoading(true);
    const list = await docsApi.listAll({ query, type });
    setDocs(list);
    setLoading(false);
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, query]);

  const groups = useMemo(() => {
    // group by category to present logical sections
    const map = {};
    for (const d of docs) {
      map[d.category] = map[d.category] || [];
      map[d.category].push(d);
    }
    return Object.entries(map).map(([category, items]) => ({ category, items }));
  }, [docs]);

  const onDownload = async (doc) => {
    setDownloading((s) => ({ ...s, [doc.id]: true }));
    try {
      const res = await docsApi.download(doc.id);
      // trigger browser download
      const a = document.createElement('a');
      a.href = res.url;
      a.download = res.filename || 'document.txt';
      document.body.appendChild(a);
      a.click();
      a.remove();
      // small delay before revoking for Firefox
      setTimeout(() => URL.revokeObjectURL(res.url), 2000);
    } catch (e) {
      alert('Failed to download document. Please try again.');
    } finally {
      setDownloading((s) => ({ ...s, [doc.id]: false }));
    }
  };

  return (
    <section className="card" style={{ overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: '0 0 4px' }}>Legal Documents & Proofs</h3>
          <p className="text-dim" style={{ margin: 0 }}>
            Download certification, IP proofs, notarized hashes, and license agreements.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              className="btn"
              aria-pressed={type === opt.key}
              onClick={() => setType(opt.key)}
              title={`Filter: ${opt.label}`}
            >
              {iconForType(opt.key)} {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <input
          aria-label="Search documents"
          placeholder="Search by title, asset, hash, or category…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={inputStyle}
        />
        <button className="btn" onClick={() => setQuery('')}>Clear</button>
      </div>

      {loading ? (
        <div className="text-dim" style={{ marginTop: 12 }}>Loading documents…</div>
      ) : docs.length === 0 ? (
        <div className="text-dim" style={{ marginTop: 12 }}>No documents found for the current filter.</div>
      ) : (
        <div style={{ display: 'grid', gap: 16, marginTop: 12 }}>
          {groups.map((g) => (
            <div key={g.category} style={{ display: 'grid', gap: 10 }}>
              <div className="text-dim" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                {g.category}
              </div>
              <div style={gridStyle}>
                {g.items.map((doc, idx) => (
                  <DocumentCard
                    key={doc.id}
                    doc={doc}
                    style={{ animationDelay: `${idx * 30}ms` }}
                    downloading={!!downloading[doc.id]}
                    onDownload={() => onDownload(doc)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function DocumentCard({ doc, onDownload, downloading, style }) {
  const tone = statusTone(doc.status);
  const ico = iconForType(doc.type);

  return (
    <article
      className="card"
      style={{
        margin: 0,
        borderColor: 'var(--border)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)), var(--bg-elev-1)',
        transform: 'translateY(6px)',
        opacity: 0,
        animation: 'docIn 600ms var(--transition-slow) forwards',
        display: 'grid',
        gap: 10,
        ...style
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            aria-hidden
            className="nav-icon"
            style={{ width: 40, height: 40, color: tone, borderColor: 'var(--border)' }}
            title={doc.type}
          >
            {ico}
          </div>
          <div>
            <strong style={{ lineHeight: 1.2 }}>{doc.title}</strong>
            <div className="text-dim" style={{ fontSize: 12 }}>
              {doc.assetName || '—'} • Issued {formatTime(doc.issuedAt)}
            </div>
          </div>
        </div>
        <StatusPill status={doc.status} />
      </header>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Meta label="Type" value={labelForType(doc.type)} />
        <Meta label="Category" value={doc.category} />
        <Meta label="Issuer" value={doc.issuer || 'Creator License Vault'} />
        <Meta label="Hash" value={doc.hash ? shorten(doc.hash) : '—'} copyable={doc.hash || ''} />
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          className={`btn ${downloading ? '' : 'btn-primary'}`}
          onClick={onDownload}
          disabled={downloading}
          title="Secure download"
        >
          {downloading ? (
            <span role="status" aria-live="polite">⏬ Preparing…</span>
          ) : (
            <>
              ⬇️ Download
            </>
          )}
        </button>
        {doc.notes ? <span className="text-dim" style={{ fontSize: 12 }}>{doc.notes}</span> : null}
      </div>
    </article>
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
    <div style={metaStyle}>
      <span className="text-dim" style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</span>
      <span>{value}</span>
      {copyable ? <button className="btn" onClick={copy} title="Copy" style={{ padding: '4px 8px' }}>📋</button> : null}
    </div>
  );
}

function StatusPill({ status }) {
  const color = statusTone(status);
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

function iconForType(t) {
  switch (t) {
    case 'proof': return '🧾';
    case 'notarized_hash': return '🔗';
    case 'certificate': return '📜';
    case 'agreement': return '🖋️';
    case 'all':
    default: return '📄';
  }
}
function labelForType(t) {
  switch (t) {
    case 'proof': return 'Proof';
    case 'notarized_hash': return 'Notarized Hash';
    case 'certificate': return 'Certificate';
    case 'agreement': return 'Agreement';
    default: return 'Document';
  }
}
function statusTone(s) {
  switch (s) {
    case 'valid': return '#5BD28C';
    case 'expired': return 'var(--secondary)';
    case 'revoked': return '#ff7670';
    case 'pending': return 'var(--primary)';
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

const inputStyle = {
  flex: 1,
  padding: '12px 14px',
  borderRadius: 12,
  background: 'var(--bg-elev-1)',
  border: '1px solid var(--border)',
  color: 'var(--text)'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 12
};

const metaStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 10px',
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.0))',
  fontSize: 12
};

// inject keyframes
(function ensureKeyframes() {
  const id = 'clv-docs-anim';
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const el = document.createElement('style');
    el.id = id;
    el.textContent = `
@keyframes docIn { to { transform: translateY(0); opacity: 1; } }
`;
    document.head.appendChild(el);
  }
})();
