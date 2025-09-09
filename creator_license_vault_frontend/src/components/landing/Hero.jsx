import React from 'react';
import { useNavigate } from 'react-router-dom';

// PUBLIC_INTERFACE
export default function Hero() {
  /** Hero section introducing Creator License Vault with bold headline, value props, and CTAs. */
  const navigate = useNavigate();
  return (
    <section className="hero container">
      <div className="hero-inner card hero-card">
        <div className="hero-copy">
          <div className="pretitle">Blockchain • Licensing • AI Monitoring</div>
          <h1 className="hero-title">
            Protect, License, and Monetize your creativity
          </h1>
          <p className="hero-desc text-dim">
            Creator License Vault gives you one-click blockchain verification, automated license terms, AI-powered monitoring, legal-grade docs, and automated revenue protection — all in one elegant dashboard.
          </p>
          <div className="hero-ctas">
            <button
              className="btn btn-primary"
              onClick={() => navigate('/dashboard')}
            >
              Launch Dashboard →
            </button>
            <button
              className="btn"
              onClick={() => {
                // Smooth scroll to features if present on page
                const el = document.getElementById('features');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))' }}
            >
              Explore Features
            </button>
          </div>
          <div className="hero-badges">
            <span className="badge">⛓️ One-click verification</span>
            <span className="badge">⚖️ Legal-grade docs</span>
            <span className="badge">🤖 AI monitoring</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="orb orb-primary" />
          <div className="orb orb-secondary" />
          <div className="orb orb-accent" />
          <div className="hero-grid">
            <div className="hero-cardlet">
              <div className="cardlet-icon">🔗</div>
              <div className="cardlet-title">Immutable Proof</div>
              <div className="cardlet-desc text-dim">Timestamped on-chain verification</div>
            </div>
            <div className="hero-cardlet">
              <div className="cardlet-icon">📝</div>
              <div className="cardlet-title">Smart Terms</div>
              <div className="cardlet-desc text-dim">Custom license templates</div>
            </div>
            <div className="hero-cardlet">
              <div className="cardlet-icon">🛰️</div>
              <div className="cardlet-title">AI Watch</div>
              <div className="cardlet-desc text-dim">Track usage across the web</div>
            </div>
            <div className="hero-cardlet">
              <div className="cardlet-icon">💸</div>
              <div className="cardlet-title">Revenue</div>
              <div className="cardlet-desc text-dim">Automated enforcement</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
