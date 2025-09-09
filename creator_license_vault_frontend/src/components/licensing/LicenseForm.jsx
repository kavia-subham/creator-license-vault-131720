import React, { useEffect, useMemo, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * LicenseForm provides a slide-in drawer to create or edit a license.
 * Includes template selection and rich fields: usage rights, duration, territory, royalties, etc.
 */
export default function LicenseForm({ open, initial, onClose, onSave, saving }) {
  const isEdit = !!(initial && initial.id);

  const templates = useMemo(() => ([
    {
      id: 'std-private',
      name: 'Standard Private',
      data: {
        usageRights: 'Private Use',
        territory: 'Worldwide',
        royalty: '0%',
        exclusivity: 'Non-exclusive',
        duration: 'Perpetual',
      }
    },
    {
      id: 'std-commercial',
      name: 'Standard Commercial',
      data: {
        usageRights: 'Commercial',
        territory: 'Worldwide',
        royalty: '10%',
        exclusivity: 'Non-exclusive',
        duration: '1 year',
      }
    },
    {
      id: 'exclusive',
      name: 'Exclusive License',
      data: {
        usageRights: 'Commercial',
        territory: 'Worldwide',
        royalty: '15%',
        exclusivity: 'Exclusive',
        duration: '2 years',
      }
    }
  ]), []);

  const [form, setForm] = useState({
    id: undefined,
    title: '',
    assetName: '',
    licensee: '',
    usageRights: '',
    territory: '',
    royalty: '',
    exclusivity: '',
    duration: '',
    startDate: '',
    endDate: '',
    notes: '',
    attachments: [],
    status: 'active',
  });

  useEffect(() => {
    if (initial) {
      setForm({ ...form, ...initial });
    } else {
      setForm(prev => ({ ...prev, id: undefined, status: 'active' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial, open]);

  const applyTemplate = (tplId) => {
    const tpl = templates.find(t => t.id === tplId);
    if (!tpl) return;
    setForm(prev => ({ ...prev, ...tpl.data }));
  };

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.assetName || !form.licensee) {
      alert('Please provide a title, asset name, and licensee.');
      return;
    }
    onSave(form);
  };

  return (
    <Drawer open={open} onClose={onClose} side="right" label={isEdit ? 'Edit License' : 'Create License'}>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>{isEdit ? 'Edit License' : 'Create License'}</h3>
          <select
            aria-label="Apply template"
            onChange={(e) => applyTemplate(e.target.value)}
            defaultValue=""
            style={selectStyle}
          >
            <option value="" disabled>Apply template…</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <Field label="Title">
          <input value={form.title} onChange={e => handleChange('title', e.target.value)} style={inputStyle} placeholder="e.g., Commercial license for Artwork #42" />
        </Field>

        <div style={twoCol}>
          <Field label="Asset Name">
            <input value={form.assetName} onChange={e => handleChange('assetName', e.target.value)} style={inputStyle} placeholder="e.g., Artwork #42" />
          </Field>
          <Field label="Licensee">
            <input value={form.licensee} onChange={e => handleChange('licensee', e.target.value)} style={inputStyle} placeholder="e.g., ACME Studios LLC" />
          </Field>
        </div>

        <div style={twoCol}>
          <Field label="Usage Rights">
            <input value={form.usageRights} onChange={e => handleChange('usageRights', e.target.value)} style={inputStyle} placeholder="e.g., Commercial, Print, Digital" />
          </Field>
          <Field label="Territory">
            <input value={form.territory} onChange={e => handleChange('territory', e.target.value)} style={inputStyle} placeholder="e.g., Worldwide, North America" />
          </Field>
        </div>

        <div style={twoCol}>
          <Field label="Royalty">
            <input value={form.royalty} onChange={e => handleChange('royalty', e.target.value)} style={inputStyle} placeholder="e.g., 10%" />
          </Field>
          <Field label="Exclusivity">
            <input value={form.exclusivity} onChange={e => handleChange('exclusivity', e.target.value)} style={inputStyle} placeholder="e.g., Exclusive / Non-exclusive" />
          </Field>
        </div>

        <div style={twoCol}>
          <Field label="Duration">
            <input value={form.duration} onChange={e => handleChange('duration', e.target.value)} style={inputStyle} placeholder="e.g., Perpetual, 1 year" />
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={e => handleChange('status', e.target.value)} style={selectStyle}>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="revoked">Revoked</option>
            </select>
          </Field>
        </div>

        <div style={twoCol}>
          <Field label="Start Date">
            <input type="date" value={form.startDate || ''} onChange={e => handleChange('startDate', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="End Date">
            <input type="date" value={form.endDate || ''} onChange={e => handleChange('endDate', e.target.value)} style={inputStyle} />
          </Field>
        </div>

        <Field label="Notes">
          <textarea value={form.notes} onChange={e => handleChange('notes', e.target.value)} style={{ ...inputStyle, minHeight: 100 }} placeholder="Any special clauses, limitations, or context." />
        </Field>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create License'}
          </button>
        </div>
      </form>
    </Drawer>
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

function Drawer({ open, onClose, side = 'right', label, children }) {
  return (
    <>
      <div
        aria-hidden={!open}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: open ? 'rgba(0,0,0,0.45)' : 'transparent',
          backdropFilter: open ? 'blur(2px)' : 'none',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity var(--transition-slow), backdrop-filter var(--transition-slow)',
          zIndex: 20
        }}
      />
      <aside
        role="dialog"
        aria-label={label}
        aria-modal="true"
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          [side]: 0,
          width: 'min(560px, 92vw)',
          background: 'var(--bg-elev-1)',
          borderLeft: side === 'right' ? '1px solid var(--border)' : undefined,
          borderRight: side === 'left' ? '1px solid var(--border)' : undefined,
          boxShadow: 'var(--shadow)',
          transform: open ? 'translateX(0)' : `translateX(${side === 'right' ? '100%' : '-100%'})`,
          transition: 'transform var(--transition-slow)',
          zIndex: 21,
          padding: 18,
          overflowY: 'auto'
        }}
      >
        {children}
      </aside>
    </>
  );
}

const inputStyle = {
  padding: '12px 14px',
  borderRadius: 12,
  background: 'var(--bg-elev-1)',
  border: '1px solid var(--border)',
  color: 'var(--text)'
};

const selectStyle = {
  ...inputStyle,
  paddingRight: 28
};

const twoCol = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 12
};
