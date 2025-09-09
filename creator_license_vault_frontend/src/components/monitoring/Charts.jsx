import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Area, AreaChart, Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

/**
 * PUBLIC_INTERFACE
 * MonitoringCharts renders:
 * - KPI counters with animated numbers for matches by day/week/month
 * - Trend chart (area + line) for matches over time
 * - Breakdown chart (donut) for platform or license type
 *
 * Props:
 * - data: {
 *     daily: number, weekly: number, monthly: number,
 *     trend: Array<{ date: string, matches: number }>,
 *     breakdown: Array<{ label: string, value: number }>
 *   }
 * If not provided, component uses a generated demo dataset.
 */
export default function MonitoringCharts({ data }) {
  const demo = useDemoData();
  const model = data || demo;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <KpiRow daily={model.daily} weekly={model.weekly} monthly={model.monthly} />

      <section className="card" aria-label="Trends over time">
        <Header title="Matches over time" subtitle="Daily detections and trend line" />
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaLineTrends data={model.trend} />
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card" aria-label="Platform breakdown">
        <Header title="Platform breakdown" subtitle="Where matches were detected" />
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <DonutBreakdown data={model.breakdown} />
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

function Header({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <h3 style={{ margin: '0 0 4px' }}>{title}</h3>
      {subtitle ? <p className="text-dim" style={{ margin: 0, fontSize: 14 }}>{subtitle}</p> : null}
    </div>
  );
}

function KpiRow({ daily, weekly, monthly }) {
  return (
    <div className="kpis">
      <KpiCard label="Matches (24h)" value={daily} tone="var(--accent)" hint="+ recent scan" />
      <KpiCard label="Matches (7d)" value={weekly} tone="var(--primary)" hint="rolling" />
      <KpiCard label="Matches (30d)" value={monthly} tone="var(--secondary)" hint="rolling" />
      <KpiCard label="Enforcements (30d)" value={Math.round(monthly * 0.18)} tone="#5BD28C" hint="actions taken" />
    </div>
  );
}

function KpiCard({ label, value, tone = 'var(--primary)', hint }) {
  const animated = useAnimatedNumber(value, 900);
  return (
    <div className="card kpi" style={{ position: 'relative' }}>
      <div className="text-dim" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          display: 'inline-block',
          width: 8, height: 8, borderRadius: 9999,
          background: tone, boxShadow: `0 0 0 2px ${tone}33`
        }} />
        {label}
      </div>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6
      }}>
        <AnimatedDigits value={animated} tone={tone} />
      </div>
      {hint ? <div className="text-dim" style={{ fontSize: 12 }}>{hint}</div> : null}
      <AccentBackdrop tone={tone} />
    </div>
  );
}

function AnimatedDigits({ value, tone }) {
  // subtle bounce on change
  const [scale, setScale] = useState(1);
  useEffect(() => {
    setScale(1.04);
    const t = setTimeout(() => setScale(1), 160);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <span style={{
        fontSize: 30,
        fontWeight: 800,
        letterSpacing: 0.4,
        transform: `scale(${scale})`,
        transition: 'transform var(--transition-fast)',
        color: 'var(--text)'
      }}>
        {Intl.NumberFormat().format(Math.round(value))}
      </span>
      <span style={{ color: tone, fontSize: 14, fontWeight: 700 }}>detections</span>
    </div>
  );
}

function AccentBackdrop({ tone }) {
  return (
    <div aria-hidden style={{
      position: 'absolute',
      inset: -1,
      background:
        `radial-gradient(600px 120px at 20% -40%, ${toRGBA(tone, .18)}, transparent 35%),
         radial-gradient(300px 120px at 120% 120%, ${toRGBA(tone, .18)}, transparent 40%)`,
      pointerEvents: 'none',
      opacity: 0.7
    }} />
  );
}

function AreaLineTrends({ data }) {
  const gridColor = 'rgba(255,255,255,0.06)';
  const axisColor = 'rgba(232,236,241,0.6)';
  const areaFill = 'rgba(108,99,255,0.25)'; // primary
  const lineStroke = '#44CFCB'; // accent

  return (
    <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={areaFill} stopOpacity={0.8} />
          <stop offset="100%" stopColor={areaFill} stopOpacity={0.05} />
        </linearGradient>
      </defs>
      <CartesianGrid stroke={gridColor} vertical={false} />
      <XAxis dataKey="date" tick={{ fill: axisColor, fontSize: 12 }} axisLine={{ stroke: gridColor }} tickLine={{ stroke: gridColor }} />
      <YAxis tick={{ fill: axisColor, fontSize: 12 }} axisLine={{ stroke: gridColor }} tickLine={{ stroke: gridColor }} />
      <Tooltip content={<DarkTooltip />} />
      <Area type="monotone" dataKey="matches" stroke="var(--primary)" strokeWidth={2} fill="url(#trendFill)" />
      <Line type="monotone" dataKey="matches" stroke={lineStroke} strokeWidth={2} dot={false} />
    </AreaChart>
  );
}

function DonutBreakdown({ data }) {
  const COLORS = ['#6C63FF', '#F67280', '#44CFCB', '#5BD28C', '#FFC46B', '#8E9BFF', '#FF9E9E'];
  const axisColor = 'rgba(232,236,241,0.75)';

  return (
    <PieChart>
      <Tooltip content={<DarkTooltip />} />
      <Legend formatter={(value) => <span style={{ color: axisColor, fontSize: 12 }}>{value}</span>} />
      <Pie
        data={data}
        dataKey="value"
        nameKey="label"
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={90}
        paddingAngle={3}
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={1}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
    </PieChart>
  );
}

function DarkTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const p = payload[0];
    return (
      <div style={{
        background: 'var(--bg-elev-1)',
        border: '1px solid var(--border)',
        color: 'var(--text)',
        borderRadius: 10,
        padding: '8px 10px',
        boxShadow: 'var(--shadow)',
        fontSize: 12
      }}>
        {label ? <div style={{ marginBottom: 4, color: 'var(--text-dim)' }}>{label}</div> : null}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            display: 'inline-block',
            width: 8, height: 8, borderRadius: 9999,
            background: p.color || 'var(--primary)'
          }} />
          <strong>{p.name || p.dataKey}:</strong>
          <span>{Intl.NumberFormat().format(p.value)}</span>
        </div>
      </div>
    );
  }
  return null;
}

/**
 * Generates a pleasant demo dataset if no data is provided via props.
 */
function useDemoData() {
  const trend = useMemo(() => {
    // 30 days history
    const days = 30;
    const out = [];
    const today = new Date();
    let base = 20;
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 86400000);
      // wave + random
      base = Math.max(4, base + (Math.random() * 10 - 5));
      const matches = Math.round(base + 6 * Math.sin(i / 3) + Math.random() * 6);
      out.push({ date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), matches });
    }
    return out;
  }, []);

  const totals = useMemo(() => {
    const last = trend.slice(-1)[0]?.matches || 0;
    const daily = Math.max(0, last);
    const weekly = trend.slice(-7).reduce((s, x) => s + x.matches, 0);
    const monthly = trend.reduce((s, x) => s + x.matches, 0);
    return { daily, weekly, monthly };
  }, [trend]);

  const breakdown = useMemo(() => {
    const labels = ['Web', 'Marketplace', 'Social', 'AI Dataset', 'News', 'Forum'];
    return labels.map((label) => ({
      label,
      value: Math.round(10 + Math.random() * 80)
    }));
  }, []);

  return { ...totals, trend, breakdown };
}

/**
 * Smoothly animates a number towards a target within a duration.
 */
function useAnimatedNumber(target, duration = 800) {
  const [val, setVal] = useState(0);
  const startRef = useRef(0);
  const fromRef = useRef(0);
  const toRef = useRef(target);

  useEffect(() => { toRef.current = target; }, [target]);

  useEffect(() => {
    let raf = 0;
    const step = (t) => {
      if (!startRef.current) startRef.current = t;
      const elapsed = t - startRef.current;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(progress);
      const next = fromRef.current + (toRef.current - fromRef.current) * eased;
      setVal(next);
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    };
    // reset and start
    startRef.current = 0;
    fromRef.current = val;
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return val;
}

function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3);
}

function toRGBA(hexOrVar, alpha) {
  // Supports CSS var or hex; for var we just add opacity via current color mixing
  if (hexOrVar?.startsWith('var(')) {
    // Fallback: return white with alpha multiplied
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
  // named or rgb string; try to insert alpha
  return hexOrVar || `rgba(108,99,255,${alpha})`;
}
