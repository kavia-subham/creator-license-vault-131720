import React from 'react';
import { useNavigate } from 'react-router-dom';

// PUBLIC_INTERFACE
export default function CTA() {
  /** Final call-to-action encouraging users to start using the platform. */
  const navigate = useNavigate();
  return (
    <section className="container">
      <div className="cta card">
        <div className="cta-left">
          <h3 className="cta-title">Ready to secure your portfolio?</h3>
          <p className="cta-desc text-dim">Start verifying assets and managing licenses in minutes.</p>
        </div>
        <div className="cta-actions">
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            Get Started
          </button>
          <a className="btn" href="#features">
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}
