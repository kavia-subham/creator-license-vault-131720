const STORAGE_KEY_REV = 'clv-revenue-v1';
const STORAGE_KEY_ALERTS = 'clv-enforcement-alerts-v1';

/**
 * PUBLIC_INTERFACE
 * revenueApi provides a stubbed data layer for revenue KPIs, timeseries, and enforcement alerts.
 * Data persists in localStorage to simulate a backend. Replace with real HTTP/WebSocket later.
 */
const revenueApi = {
  // PUBLIC_INTERFACE
  async getOverview() {
    /** Return KPI totals and 12-month revenue trend. */
    await delay(180);
    const model = getRevenue();
    return model;
  },

  // PUBLIC_INTERFACE
  async listAlerts({ type = 'all', query = '' } = {}) {
    /** Return filtered list of enforcement alerts (DMCA, payment due, settlement). */
    await delay(150);
    const q = query.trim().toLowerCase();
    const all = getAlerts();
    return all.filter((a) => {
      const okType = type === 'all' || a.type === type;
      const okQ =
        !q ||
        [a.title, a.counterparty, a.status, a.id].some((x) => String(x || '').toLowerCase().includes(q));
      return okType && okQ;
    });
  },

  // PUBLIC_INTERFACE
  async markAlertRead(id) {
    /** Mark an alert as read. Returns updated alert. */
    await delay(80);
    const [data, idx] = findAlertIndex(id);
    if (idx === -1) return null;
    const updated = { ...data[idx], read: true, updatedAt: new Date().toISOString() };
    data[idx] = updated;
    setAlerts(data);
    return updated;
  },

  // PUBLIC_INTERFACE
  async resolveAlert(id) {
    /** Resolve an alert (e.g., settlement reached, payment processed). */
    await delay(120);
    const [data, idx] = findAlertIndex(id);
    if (idx === -1) return null;
    const updated = { ...data[idx], status: 'resolved', updatedAt: new Date().toISOString() };
    data[idx] = updated;
    setAlerts(data);
    return updated;
  }
};

export default revenueApi;

// Helpers

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function getRevenue() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REV);
    if (!raw) {
      const seeded = seedRevenue();
      setRevenue(seeded);
      return seeded;
    }
    return JSON.parse(raw);
  } catch {
    const seeded = seedRevenue();
    setRevenue(seeded);
    return seeded;
  }
}

function setRevenue(value) {
  try {
    localStorage.setItem(STORAGE_KEY_REV, JSON.stringify(value));
  } catch {}
}

function getAlerts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ALERTS);
    if (!raw) {
      const seeded = seedAlerts();
      setAlerts(seeded);
      return seeded;
    }
    return JSON.parse(raw);
  } catch {
    const seeded = seedAlerts();
    setAlerts(seeded);
    return seeded;
  }
}

function setAlerts(value) {
  try {
    localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(value));
  } catch {}
}

function findAlertIndex(id) {
  const data = getAlerts();
  const idx = data.findIndex((a) => a.id === id);
  return [data, idx];
}

function seedRevenue() {
  // Build 12 months of revenue, with random yet smooth variation
  const months = [];
  const now = new Date();
  let base = 800; // base monthly revenue
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    base = Math.max(300, base + Math.random() * 160 - 80);
    const earned = Math.round(base + 100 * Math.sin(i / 2.3) + Math.random() * 80);
    const protectedAmt = Math.round(earned * (0.22 + Math.random() * 0.15));
    months.push({
      month: d.toLocaleString(undefined, { month: 'short' }),
      revenue: earned,
      protected: protectedAmt
    });
  }

  const totalRevenue = months.reduce((s, m) => s + m.revenue, 0);
  const totalProtected = months.reduce((s, m) => s + m.protected, 0);
  const realized = Math.round(totalRevenue * 0.82);
  const mtd = months[months.length - 1]?.revenue || 0;
  const prev = months[months.length - 2]?.revenue || mtd;
  const growth = prev ? ((mtd - prev) / prev) * 100 : 0;

  return {
    totals: {
      totalRevenue,
      realized,
      totalProtected,
      mtd,
      growth
    },
    series: months
  };
}

function seedAlerts() {
  const mk = (id, type, title, counterparty, amount, status = 'open') => ({
    id,
    type, // 'dmca' | 'payment' | 'settlement'
    title,
    counterparty,
    amount,
    status,
    read: false,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 15)).toISOString(),
    updatedAt: new Date().toISOString()
  });

  return [
    mk('alrt_1', 'dmca', 'DMCA takedown issued', 'ImageHub', 0, 'open'),
    mk('alrt_2', 'payment', 'License payment overdue (Net 15)', 'VectorWorks Inc.', 950, 'open'),
    mk('alrt_3', 'settlement', 'Proposed settlement received', 'Stockify', 1800, 'open'),
    mk('alrt_4', 'payment', 'Partial payment received', 'Lumina Studio', 450, 'open'),
    mk('alrt_5', 'dmca', 'Follow-up notice sent', 'AI Mirror', 0, 'open'),
  ];
}
