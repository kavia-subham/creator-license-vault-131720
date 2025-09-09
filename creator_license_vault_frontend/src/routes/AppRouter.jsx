import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Landing from '../pages/Landing';
import Licensing from '../pages/Licensing';
import Verification from '../pages/Verification';
import Monitoring from '../pages/Monitoring';
import Revenue from '../pages/Revenue';
import Documents from '../pages/Documents';

// Simple Dash mock as before
const Dashboard = () => (
  <div className="page">
    <div className="kpis">
      <div className="card kpi">
        <div className="text-dim">Verified Assets</div>
        <h2 style={{margin: '8px 0 0'}}>128</h2>
        <div className="text-dim" style={{fontSize: 12}}>+5 this week</div>
      </div>
      <div className="card kpi">
        <div className="text-dim">Active Licenses</div>
        <h2 style={{margin: '8px 0 0'}}>64</h2>
        <div className="text-dim" style={{fontSize: 12}}>3 expiring soon</div>
      </div>
      <div className="card kpi">
        <div className="text-dim">Monitoring Alerts</div>
        <h2 style={{margin: '8px 0 0'}}>7</h2>
        <div className="text-dim" style={{fontSize: 12, color: 'var(--secondary)'}}>2 critical</div>
      </div>
      <div className="card kpi">
        <div className="text-dim">Revenue (30d)</div>
        <h2 style={{margin: '8px 0 0'}}>$12,450</h2>
        <div className="text-dim" style={{fontSize: 12, color: 'var(--accent)'}}>+18%</div>
      </div>
    </div>

    <div className="page-grid">
      <div className="card">
        <h3 style={{marginTop: 0}}>Recent Verifications</h3>
        <p className="text-dim">Quick snapshot of your latest verified assets.</p>
      </div>
      <div className="card">
        <h3 style={{marginTop: 0}}>Notifications</h3>
        <p className="text-dim">Real-time alerts will appear here.</p>
      </div>
    </div>

    <div style={{marginTop: 8}}>
      <Link className="btn" to="/">← Back to Landing</Link>
    </div>
  </div>
);

const Placeholder = ({ title }) => (
  <div className="page">
    <div className="card">
      <h2 style={{marginTop: 0}}>{title}</h2>
      <p className="text-dim">Beautiful content coming soon. This page is ready for future feature integration.</p>
      <div style={{marginTop: 8}}>
        <Link className="btn" to="/">← Back to Landing</Link>
      </div>
    </div>
  </div>
);

// PUBLIC_INTERFACE
export default function AppRouter() {
  /**
   * Router composition with MainLayout wrapper and routes.
   * Landing page available on '/' for marketing flow; dashboard on '/dashboard'.
   */
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/licensing" element={<Licensing />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/revenue" element={<Revenue />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/notifications" element={<Placeholder title="Notifications" />} />
          <Route path="/settings" element={<Placeholder title="Settings" />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Placeholder title="Not Found" />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}
