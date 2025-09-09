import React from 'react';

const features = [
  {
    icon: '🔗',
    title: 'One-click blockchain verification',
    desc: 'Instantly anchor your asset fingerprint to the blockchain for immutable proof.',
    tone: 'primary',
  },
  {
    icon: '📝',
    title: 'Automated license terms',
    desc: 'Generate and manage customizable licenses — private, commercial, exclusive.',
    tone: 'secondary',
  },
  {
    icon: '🤖',
    title: 'AI dashboard',
    desc: 'Monitor web usage with AI-powered detection and smart alerts.',
    tone: 'accent',
  },
  {
    icon: '⚖️',
    title: 'Legal-grade docs',
    desc: 'Download ready-to-send notices and documentation packages.',
    tone: 'primary',
  },
  {
    icon: '💸',
    title: 'Revenue protection',
    desc: 'Automated enforcement flows to protect your income.',
    tone: 'secondary',
  },
];

// PUBLIC_INTERFACE
export default function Features() {
  /** Feature grid with motion accents and hover animation. */
  return (
    <section id="features" className="container">
      <div className="section-head">
        <h2 className="section-title">Everything you need to safeguard your work</h2>
        <p className="section-subtitle text-dim">
          Powerful tooling, minimal complexity — designed for creators.
        </p>
      </div>

      <div className="features-grid">
        {features.map((f, i) => (
          <article className={`feature-card tone-${f.tone}`} key={i} style={{ animationDelay: `${i * 60}ms` }}>
            <div className="feature-icon" aria-hidden>{f.icon}</div>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-desc text-dim">{f.desc}</p>
            <div className="feature-accent" />
          </article>
        ))}
      </div>
    </section>
  );
}
