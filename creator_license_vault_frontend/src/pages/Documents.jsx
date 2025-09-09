import React from 'react';
import DocumentsList from '../components/docs/DocumentsList';

/**
 * PUBLIC_INTERFACE
 * Documents page: Legal Documents downloads and proofs.
 * Lists downloadable certification, IP proofs, notarized hashes, and license agreements
 * with animated download actions and status indicators. Dark, responsive layout.
 */
export default function Documents() {
  return (
    <div className="page">
      <section className="card" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: '0 0 4px' }}>Legal Documents</h2>
            <p className="text-dim" style={{ margin: 0 }}>
              Access your legal-grade documentation packages and cryptographic proofs.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <a className="btn" href="#docs-help" onClick={(e) => { e.preventDefault(); alert('For audit-ready exports, connect your backend in docsApi.js.'); }}>
              ❓ Help
            </a>
            <button className="btn">Export All</button>
          </div>
        </div>
      </section>

      <DocumentsList />
    </div>
  );
}
