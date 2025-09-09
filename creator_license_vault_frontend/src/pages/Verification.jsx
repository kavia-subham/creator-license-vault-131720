import React, { useEffect, useMemo, useState } from 'react';
import AssetUpload from '../components/verification/AssetUpload';
import VerificationStatusCard from '../components/verification/VerificationStatusCard';
import verificationApi from '../services/api/verificationApi';

/**
 * PUBLIC_INTERFACE
 * Verification page provides a complete flow to verify an asset on chain:
 * - Upload file or paste URL with optional metadata
 * - Initiate verification
 * - See real-time progress with confirmations and explorer links
 * - Review recent verifications and their statuses
 */
export default function Verification() {
  const [form, setForm] = useState({
    file: null,
    url: '',
    title: '',
    description: '',
    tags: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('all'); // all|pending|onchain|success|failed

  // Load existing jobs from stub "backend"
  useEffect(() => {
    let active = true;
    (async () => {
      const list = await verificationApi.list();
      if (active) setJobs(list);
    })();
    // subscribe to progress updates
    const unsub = verificationApi.subscribe((job) => {
      setJobs((prev) => {
        const idx = prev.findIndex((j) => j.id === job.id);
        const next = idx === -1 ? [job, ...prev] : prev.map((j) => (j.id === job.id ? job : j));
        return next;
      });
      if (currentJob && currentJob.id === job.id) {
        setCurrentJob(job);
      }
    });
    return () => {
      active = false;
      unsub?.();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredJobs = useMemo(() => {
    if (filter === 'all') return jobs;
    return jobs.filter((j) => j.status === filter || (filter === 'onchain' && j.status === 'onchain'));
  }, [jobs, filter]);

  const onStartVerification = async () => {
    if (!form.file && !form.url) {
      alert('Please upload a file or provide a URL.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: form.title?.trim() || (form.file ? form.file.name : 'Untitled Asset'),
        description: form.description?.trim() || '',
        tags: form.tags?.trim() || '',
        sourceType: form.file ? 'file' : 'url',
        url: form.url || '',
        // Note: in real backend we would send File/Blob via multipart/form-data
        // In stub, we serialize lightweight metadata only.
      };
      const job = await verificationApi.start(payload);
      setJobs((prev) => [job, ...prev]);
      setCurrentJob(job);
      // Smooth scroll to status area
      requestAnimationFrame(() => {
        const el = document.getElementById('verification-status-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onCancelJob = async (job) => {
    await verificationApi.cancel(job.id);
  };

  return (
    <div className="page">
      <section className="card" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: '0 0 4px' }}>Blockchain Verification</h2>
            <p className="text-dim" style={{ margin: 0 }}>
              Create an immutable, timestamped proof of authorship. Upload a file or provide a URL and verify in one click.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={() => setFilter('all')} aria-pressed={filter === 'all'}>All</button>
            <button className="btn" onClick={() => setFilter('pending')} aria-pressed={filter === 'pending'}>Pending</button>
            <button className="btn" onClick={() => setFilter('onchain')} aria-pressed={filter === 'onchain'}>On-chain</button>
            <button className="btn" onClick={() => setFilter('success')} aria-pressed={filter === 'success'}>Success</button>
            <button className="btn" onClick={() => setFilter('failed')} aria-pressed={filter === 'failed'}>Failed</button>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <AssetUpload
            value={form}
            onChange={setForm}
            onSubmit={onStartVerification}
            submitting={submitting}
          />
        </div>
      </section>

      <section className="page-grid">
        <div className="card" id="verification-status-section">
          <h3 style={{ marginTop: 0 }}>Verification Status</h3>
          {currentJob ? (
            <VerificationStatusCard
              job={currentJob}
              onCancel={() => onCancelJob(currentJob)}
            />
          ) : (
            <div className="text-dim" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 18 }}>🧾</span>
              <span>No active verification yet. Start by uploading an asset or providing a URL above.</span>
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Recent Verifications</h3>
          {filteredJobs.length === 0 ? (
            <div className="text-dim">No verifications found for selected filter.</div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {filteredJobs.map((job) => (
                <VerificationStatusCard
                  key={job.id}
                  job={job}
                  compact
                  onFocus={() => setCurrentJob(job)}
                  onCancel={() => onCancelJob(job)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
