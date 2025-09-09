import React, { useEffect, useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line } from 'recharts';
import revenueApi from '../../services/api/revenueApi';

/**
 * PUBLIC_INTERFACE
 * RevenueOverview renders:
 * - KPI cards: Total Protected, Realized Revenue, Total Revenue, MTD with growth
 * - Animated monthly revenue time series (area + line)
 *
 * Props:
 * - data?: override data { totals: {...}, series: [...] }
 */
export default function RevenueOverview({ data }) {
  const [model, setModel] = useState(data || null);
  useEffect(() => {
    let mounted = true;
    if (!data) {
      (async () => {
        const res = await revenueApi.getOverview();
        if (mounted) setModel(res);
      })();
    }
    return () => {
      mounted = false;
    };
  }, [data]);

  const totals = model?.totals || { totalProtected: 0, realized: 0, totalRevenue: 0, mtd: 0, growth: 0 };
  const series = model?.series || [];

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <KpiGrid totals={totals} />
      <section className="card" aria-label="Revenue trend">
        <div style={{ marginBottom: 8 }}>
          <h3 style={{ margin: '0 0 4px' }}>Revenue trend</h3>
          <p className="text-dim" style={{ margin: 0 }}>
            Monthly realized and protected revenue over the last 12 months.
          </p>
        </div>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RevenueTrend data={series} />
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

function KpiGrid({ totals }) {
  const items = useMemo(
    () => [
      { label: 'Total Protected', value: totals.totalProtected, prefix: '$', tone: 'var(--accent)', hint: 'from enforcement' },
      { label: 'Realized Revenue', value: totals.realized, prefix: '$', tone: '#5BD28C', hint: 'after fees' },
      { label: 'Total Revenue (12m)', value: totals.totalRevenue, prefix: '$', tone: 'var(--primary)', hint: 'gross' },
      { label: `MTD (${formatGrowth(totals.growth)})`, value: totals.mtd, prefix: '$', tone: totals.growth >= 0 ? '#5BD28C' : '#ff7670', hint: 'vs last month' },
    ],
    [totals]
  );

  return (
    <div className="kpis">
      {items.map((k) => (
        <KpiCard key={k.label} {...k} />
      ))}
    </div>
  );
}

function KpiCard({ label, value, prefix = '', tone = 'var(--primary)', hint }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const to = value || 0;
    const dur = 900;
    let raf = 0;
    const step = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimated(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <article className="card kpi" style={{ position: 'relative' }}>
      <div className="text-dim" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          aria-hidden
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: 9999,
            background: tone,
            boxShadow: `0 0 0 2px ${toRGBA(tone, 0.35)}`
          }}
        />
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
        <span
          style={{
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: 0.4,
            color: 'var(--text)',
            transition: 'transform var(--transition-fast)'
          }}
        >
          {prefix}
          {Intl.NumberFormat().format(Math.round(animated))}
        </span>
      </div>
      {hint ? <div className="text-dim" style={{ fontSize: 12 }}>{hint}</div> : null}
      <AccentBackdrop tone={tone} />
    </article>
  );
}

function RevenueTrend({ data }) {
  const gridColor = 'rgba(255,255,255,0.06)';
  const axisColor = 'rgba(232,236,241,0.75)';
  const fillPrimary = 'rgba(108,99,255,0.25)';
  const lineAccent = '#44CFCB';

  return (
    <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillPrimary} stopOpacity={0.85} />
          <stop offset="100%" stopColor={fillPrimary} stopOpacity={0.06} />
        </linearGradient>
      </defs>
      <CartesianGrid stroke={gridColor} vertical={false} />
      <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 12 }} axisLine={{ stroke: gridColor }} tickLine={{ stroke: gridColor }} />
      <YAxis tick={{ fill: axisColor, fontSize: 12 }} axisLine={{ stroke: gridColor }} tickLine={{ stroke: gridColor }} />
      <Tooltip content={<DarkTooltip prefix="$" />} />
      <Area type="monotone" dataKey="revenue" name="Revenue" stroke="var(--primary)" strokeWidth={2} fill="url(#revFill)" />
      <Line type="monotone" dataKey="protected" name="Protected" stroke={lineAccent} strokeWidth={2} dot={false} />
    </AreaChart>
  );
}

function DarkTooltip({ active, payload, label, prefix = '' }) {
  if (active && payload && payload.length) {
    const items = payload;
    return (
      <div
        style={{
          background: 'var(--bg-elev-1)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          borderRadius: 10,
          padding: '8px 10px',
          boxShadow: 'var(--shadow)',
          fontSize: 12
        }}
      >
        <div style={{ marginBottom: 4, color: 'var(--text-dim)' }}>{label}</div>
        <div style={{ display: 'grid', gap: 4 }}>
          {items.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: 9999,
                  background: p.color || 'var(--primary)'
                }}
              />
              <strong>{p.name || p.dataKey}:</strong>
              <span>
                {prefix}
                {Intl.NumberFormat().format(p.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

function AccentBackdrop({ tone }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: -1,
        background:
          `radial-gradient(600px 120px at 20% -40%, ${toRGBA(tone, 0.18)}, transparent 35%),
           radial-gradient(300px 120px at 120% 120%, ${toRGBA(tone, 0.18)}, transparent 40%)`,
        pointerEvents: 'none',
        opacity: 0.7
      }}
    />
  );
}

function toRGBA(hexOrVar, alpha) {
  if (hexOrVar?.startsWith('var(')) {
    return `rgba(108,99,255,${alpha})`;
  }
  if (hexOrVar?.startsWith('#')) {
    const hex = hexOrVar.replace('#', '');
    const bigint = parseInt(hex.length === 3 ? hex.split('').map((h) => h + h).join('') : hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hexOrVar || `rgba(108,99,255,${alpha})`;
}

function formatGrowth(g) {
  if (!isFinite(g)) return '0%';
  const sign = g >= 0 ? '+' : '';
  return `${sign}${g.toFixed(1)}%`;
}
