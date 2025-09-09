const STORAGE_KEY = 'clv-licenses-v1';

/**
 * PUBLIC_INTERFACE
 * licensingApi is a stub integration layer simulating CRUD for licenses.
 * Data is persisted in localStorage to mimic backend behavior until API is available.
 */
const licensingApi = {
  async list() {
    await delay(200);
    return getStore();
  },

  async get(id) {
    await delay(100);
    return getStore().find(l => l.id === id) || null;
  },

  async create(payload) {
    await delay(250);
    const now = new Date();
    const rec = {
      ...payload,
      id: 'lic_' + Math.random().toString(36).slice(2, 9),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      status: payload.status || 'active',
    };
    const data = [rec, ...getStore()];
    setStore(data);
    return rec;
  },

  async update(id, payload) {
    await delay(250);
    const data = getStore();
    const idx = data.findIndex(l => l.id === id);
    if (idx === -1) throw new Error('License not found');
    const updated = { ...data[idx], ...payload, id, updatedAt: new Date().toISOString() };
    data[idx] = updated;
    setStore(data);
    return updated;
  },

  async revoke(id) {
    await delay(200);
    const data = getStore();
    const idx = data.findIndex(l => l.id === id);
    if (idx === -1) throw new Error('License not found');
    const updated = { ...data[idx], status: 'revoked', updatedAt: new Date().toISOString() };
    data[idx] = updated;
    setStore(data);
    return updated;
  },

  async remove(id) {
    await delay(150);
    const filtered = getStore().filter(l => l.id !== id);
    setStore(filtered);
    return true;
  }
};

export default licensingApi;

// Helpers

function getStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = seedData();
      setStore(seed);
      return seed;
    }
    return JSON.parse(raw);
  } catch {
    const seed = seedData();
    setStore(seed);
    return seed;
  }
}

function setStore(value) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch {}
}

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function seedData() {
  const today = new Date();
  const plus = (d) => new Date(today.getTime() + d * 86400000).toISOString().slice(0, 10);
  return [
    {
      id: 'lic_demo_1',
      title: 'Commercial License - Poster Series',
      assetName: 'Neon City Poster #12',
      licensee: 'VectorWorks Inc.',
      usageRights: 'Commercial Print',
      territory: 'North America',
      royalty: '8%',
      exclusivity: 'Non-exclusive',
      duration: '1 year',
      startDate: plus(-30),
      endDate: plus(335),
      notes: 'Retail print runs up to 10k units.',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'lic_demo_2',
      title: 'Exclusive Brand Campaign',
      assetName: 'Aurora Gradient Pack',
      licensee: 'Lumina Studio',
      usageRights: 'Commercial Digital',
      territory: 'Worldwide',
      royalty: '12%',
      exclusivity: 'Exclusive',
      duration: '6 months',
      startDate: plus(-200),
      endDate: plus(-10),
      notes: 'Campaign ended; usage window closed.',
      status: 'expired',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'lic_demo_3',
      title: 'Private Collector License',
      assetName: 'Voxel Sculpture 3D',
      licensee: 'A. Ng',
      usageRights: 'Private Use',
      territory: 'Worldwide',
      royalty: '0%',
      exclusivity: 'Non-exclusive',
      duration: 'Perpetual',
      startDate: plus(-400),
      endDate: '',
      notes: 'Non-transferable.',
      status: 'revoked',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];
}
