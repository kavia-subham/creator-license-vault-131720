const STORAGE_KEY = 'clv-verifications-v1';

const listeners = new Set();

/**
 * PUBLIC_INTERFACE
 * verificationApi simulates a backend for blockchain verification with localStorage persistence.
 * It provides:
 * - list(): get all jobs
 * - start(payload): create a job and simulate progress to on-chain success/failure
 * - get(id): fetch job
 * - cancel(id): cancel job if in progress
 * - subscribe(cb): subscribe to job updates (unsub returns a function)
 *
 * Future integration notes:
 * Replace timers with WebSocket events. Keep API surface identical to minimize refactors.
 */
const verificationApi = {
  async list() {
    await delay(150);
    return getStore();
  },

  async get(id) {
    await delay(80);
    return getStore().find(j => j.id === id) || null;
  },

  async start(payload) {
    await delay(150);
    const now = new Date();
    const job = {
      id: 'ver_' + Math.random().toString(36).slice(2, 10),
      title: payload.title || 'Untitled Asset',
      description: payload.description || '',
      tags: payload.tags || '',
      sourceType: payload.sourceType || 'url',
      url: payload.url || '',
      assetHash: randomHash(),
      status: 'pending', // pending -> onchain -> success|failed
      progress: 10,
      confirmations: 0,
      network: 'Testnet',
      explorerBase: 'https://explorer.testnet.example',
      explorerUrl: '', // set when txHash is ready
      txHash: '',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      message: 'Preparing verification: computing fingerprint and creating transaction...',
    };
    const data = [job, ...getStore()];
    setStore(data);
    emit(job);
    // simulate chain lifecycle
    simulateLifecycle(job.id);
    return job;
  },

  async cancel(id) {
    await delay(80);
    const [data, idx] = findIndex(id);
    if (idx === -1) return null;
    const cur = data[idx];
    if (cur.status === 'pending' || cur.status === 'onchain') {
      const updated = { ...cur, status: 'failed', error: 'Cancelled by user', progress: cur.progress, updatedAt: new Date().toISOString() };
      data[idx] = updated;
      setStore(data);
      emit(updated);
      return updated;
    }
    return cur;
  },

  subscribe(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  }
};

export default verificationApi;

// Helpers

function getStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = [];
      setStore(seed);
      return seed;
    }
    return JSON.parse(raw);
  } catch {
    const seed = [];
    setStore(seed);
    return seed;
  }
}

function setStore(value) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch {}
}

function findIndex(id) {
  const data = getStore();
  const idx = data.findIndex(j => j.id === id);
  return [data, idx];
}

function updateJob(id, patch) {
  const [data, idx] = findIndex(id);
  if (idx === -1) return null;
  const next = { ...data[idx], ...patch, updatedAt: new Date().toISOString() };
  data[idx] = next;
  setStore(data);
  emit(next);
  return next;
}

function emit(job) {
  listeners.forEach((cb) => {
    try { cb(job); } catch {}
  });
}

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function randomHash() {
  // 32-byte hash hex
  let s = '0x';
  const hex = 'abcdef0123456789';
  for (let i = 0; i < 64; i++) s += hex[Math.floor(Math.random() * hex.length)];
  return s;
}

async function simulateLifecycle(id) {
  // Step 1: progress pending
  for (let i = 10; i <= 40; i += 10) {
    await delay(400);
    const job = updateJob(id, { progress: i, message: 'Uploading proof and preparing transaction...' });
    if (!job || job.status === 'failed') return;
  }
  // Step 2: broadcast on-chain
  const txHash = randomHash();
  const base = 'https://explorer.testnet.example';
  let job = updateJob(id, {
    status: 'onchain',
    progress: 55,
    txHash,
    explorerUrl: `${base}/tx/${txHash}`,
    explorerBase: base,
    message: 'Transaction broadcast to network. Awaiting confirmations...'
  });
  if (!job) return;

  // Step 3: confirmations
  for (let c = 1; c <= 4; c++) {
    await delay(900);
    job = updateJob(id, {
      progress: Math.min(88, 55 + c * 8),
      confirmations: c,
      message: `Confirmations: ${c}/4`
    });
    if (!job || job.status === 'failed') return;
  }

  // Step 4: success/failure outcome
  await delay(700);
  const ok = Math.random() > 0.12; // 88% success
  if (ok) {
    updateJob(id, {
      status: 'success',
      progress: 100,
      message: 'Verification successful! Your asset proof is now anchored on-chain.'
    });
  } else {
    updateJob(id, {
      status: 'failed',
      progress: 100,
      error: 'Network fee too low. Please try again later.',
      message: 'Verification failed during confirmation stage.'
    });
  }
}
