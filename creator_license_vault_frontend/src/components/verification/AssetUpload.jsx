import React, { useCallback, useRef, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * AssetUpload provides an animated drag-and-drop area or URL input, plus metadata fields.
 * Props:
 * - value: { file: File|null, url: string, title: string, description: string, tags: string }
 * - onChange: fn(next)
 * - onSubmit: fn()
 * - submitting: boolean
 */
export default function AssetUpload({ value, onChange, onSubmit, submitting }) {
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef();

  const onDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) {
      onChange({ ...value, file: f, url: '' });
    }
  }, [onChange, value]);

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const pickFile = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    onChange({ ...value, file: null });
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      onChange({ ...value, file: f, url: '' });
    }
  };

  const canSubmit = Boolean(value.file || value.url) && !submitting;

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border)',
          background: dragging
            ? 'linear-gradient(180deg, rgba(108,99,255,0.08), rgba(68,207,203,0.06)), var(--bg-elev-1)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.0)), var(--bg-elev-1)',
          minHeight: 140,
          display: 'grid',
          placeItems: 'center',
          boxShadow: dragging ? 'var(--ring)' : 'var(--shadow)',
          transition: 'all var(--transition-slow)',
          overflow: 'hidden'
        }}
        aria-label="Upload area"
      >
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute',
            inset: -1,
            opacity: dragging ? 0.8 : 0.45,
            background: 'radial-gradient(600px 160px at 10% -20%, rgba(108,99,255,0.16), transparent 40%), radial-gradient(420px 160px at 120% 120%, rgba(68,207,203,0.16), transparent 45%)',
            transition: 'opacity var(--transition-fast)'
          }} />
        </div>

        <div style={{ textAlign: 'center', zIndex: 1 }}>
          {value.file ? (
            <>
              <div style={{ fontSize: 24, marginBottom: 6 }}>📄 {value.file.name}</div>
              <div className="text-dim" style={{ fontSize: 13 }}>
                {(value.file.size / (1024 * 1024)).toFixed(2)} MB
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 8, justifyContent: 'center' }}>
                <button className="btn" onClick={pickFile}>Change File</button>
                <button className="btn" onClick={removeFile}>Remove</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 22, marginBottom: 8 }}>Drag & drop your file here</div>
              <div className="text-dim" style={{ fontSize: 13, marginBottom: 10 }}>or</div>
              <button className="btn btn-primary" onClick={pickFile}>Choose File</button>
            </>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* floating accent orbs */}
        <div className="orb orb-primary" style={{ width: 90, height: 90, top: 12, right: 12, filter: 'blur(18px)' }} />
        <div className="orb orb-accent" style={{ width: 70, height: 70, bottom: 12, left: 12, filter: 'blur(18px)' }} />
      </div>

      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr' }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span className="text-dim" style={{ fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase' }}>Or verify by URL</span>
          <input
            placeholder="https://example.com/your-asset"
            value={value.url}
            onChange={(e) => onChange({ ...value, url: e.target.value, file: value.file ? null : null })}
            style={inputStyle}
          />
        </label>

        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr 1fr' }}>
          <Field label="Title">
            <input
              placeholder="e.g., Aurora Gradient Pack"
              value={value.title}
              onChange={(e) => onChange({ ...value, title: e.target.value })}
              style={inputStyle}
            />
          </Field>
          <Field label="Tags">
            <input
              placeholder="e.g., gradient, poster, series"
              value={value.tags}
              onChange={(e) => onChange({ ...value, tags: e.target.value })}
              style={inputStyle}
            />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            placeholder="Short description to appear in verification record (optional)."
            value={value.description}
            onChange={(e) => onChange({ ...value, description: e.target.value })}
            style={{ ...inputStyle, minHeight: 90 }}
          />
        </Field>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button className="btn" onClick={() => onChange({ file: null, url: '', title: '', description: '', tags: '' })}>
          Reset
        </button>
        <button className="btn btn-primary" onClick={onSubmit} disabled={!canSubmit} title="Start verification">
          {submitting ? 'Starting…' : 'Verify on chain'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span className="text-dim" style={{ fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase' }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle = {
  padding: '12px 14px',
  borderRadius: 12,
  background: 'var(--bg-elev-1)',
  border: '1px solid var(--border)',
  color: 'var(--text)'
};
