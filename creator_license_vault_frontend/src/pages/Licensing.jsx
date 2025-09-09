import React, { useEffect, useMemo, useState } from 'react';
import LicenseList from '../components/licensing/LicenseList';
import LicenseForm from '../components/licensing/LicenseForm';
import LicenseDetailDrawer from '../components/licensing/LicenseDetailDrawer';
import licensingApi from '../services/api/licensingApi';

/**
 * PUBLIC_INTERFACE
 * Licensing page hosting the end-to-end experience:
 * - Displays filterable list of licenses
 * - Provides creation and editing via a slide-in form drawer
 * - Shows detailed view and actions in an animated drawer
 */
export default function Licensing() {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null); // license object for detail
  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState(null); // object for edit
  const [drawerMode, setDrawerMode] = useState('detail'); // 'detail' | 'form'
  const [saving, setSaving] = useState(false);

  // Load initial data (placeholder API)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const data = await licensingApi.list();
      if (mounted) {
        setLicenses(data);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return licenses.filter(l => {
      const matchesQ = !q || [l.title, l.licensee, l.assetName, l.territory, l.usageRights].some(x =>
        String(x || '').toLowerCase().includes(q)
      );
      const matchesS = statusFilter === 'all' || l.status === statusFilter;
      return matchesQ && matchesS;
    });
  }, [licenses, query, statusFilter]);

  const openCreate = () => {
    setFormInitial(null);
    setDrawerMode('form');
    setFormOpen(true);
  };

  const openEdit = (lic) => {
    setFormInitial(lic);
    setDrawerMode('form');
    setFormOpen(true);
  };

  const openDetail = (lic) => {
    setSelected(lic);
    setDrawerMode('detail');
    setFormOpen(true);
  };

  const closeDrawer = () => {
    setFormOpen(false);
    setSelected(null);
    setFormInitial(null);
  };

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (payload.id) {
        const updated = await licensingApi.update(payload.id, payload);
        setLicenses(prev => prev.map(l => (l.id === updated.id ? updated : l)));
        setSelected(updated);
        setDrawerMode('detail');
      } else {
        const created = await licensingApi.create(payload);
        setLicenses(prev => [created, ...prev]);
        setSelected(created);
        setDrawerMode('detail');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async (lic) => {
    const updated = await licensingApi.revoke(lic.id);
    setLicenses(prev => prev.map(l => (l.id === updated.id ? updated : l)));
    setSelected(updated);
  };

  const handleDelete = async (lic) => {
    if (!window.confirm('Delete this license permanently?')) return;
    await licensingApi.remove(lic.id);
    setLicenses(prev => prev.filter(l => l.id !== lic.id));
    closeDrawer();
  };

  return (
    <div className="page">
      <section className="card" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: '0 0 4px' }}>Licensing</h2>
            <p className="text-dim" style={{ margin: 0 }}>Manage contracts, usage rights, and terms. Create new agreements in seconds.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={() => setStatusFilter('all')} aria-pressed={statusFilter==='all'}>All</button>
            <button className="btn" onClick={() => setStatusFilter('active')} aria-pressed={statusFilter==='active'}>Active</button>
            <button className="btn" onClick={() => setStatusFilter('expired')} aria-pressed={statusFilter==='expired'}>Expired</button>
            <button className="btn" onClick={() => setStatusFilter('revoked')} aria-pressed={statusFilter==='revoked'}>Revoked</button>
            <button className="btn btn-primary" onClick={openCreate}>➕ New License</button>
          </div>
        </div>

        <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px', display: 'flex', gap: 8 }}>
            <input
              aria-label="Search licenses"
              placeholder="Search by title, licensee, asset, territory, or usage..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 14px',
                borderRadius: 12,
                background: 'var(--bg-elev-1)',
                border: '1px solid var(--border)',
                color: 'var(--text)'
              }}
            />
            <button className="btn" onClick={() => setQuery('')}>Clear</button>
          </div>
        </div>
      </section>

      <LicenseList
        loading={loading}
        items={filtered}
        onOpenDetail={openDetail}
        onEdit={openEdit}
        onRevoke={handleRevoke}
      />

      <LicenseDetailDrawer
        open={formOpen && drawerMode === 'detail' && !!selected}
        license={selected}
        onClose={closeDrawer}
        onEdit={() => openEdit(selected)}
        onRevoke={() => handleRevoke(selected)}
        onDelete={() => handleDelete(selected)}
      />

      <LicenseForm
        open={formOpen && drawerMode === 'form'}
        initial={formInitial}
        onClose={closeDrawer}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}
