import React from 'react';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import CTA from '../components/landing/CTA';

// PUBLIC_INTERFACE
export default function Landing() {
  /** Landing page: Hero + Features + CTA with dark, high-impact visuals and smooth animations. */
  return (
    <div className="landing">
      <Hero />
      <Features />
      <CTA />
    </div>
  );
}
