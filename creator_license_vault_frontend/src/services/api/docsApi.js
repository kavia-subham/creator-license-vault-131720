const STORAGE_KEY_DOCS = 'clv-docs-v1';

/**
 * PUBLIC_INTERFACE
 * docsApi simulates fetching and downloading legal documents: proofs, notarized hashes,
 * verification certificates, and license agreements. It persists in localStorage to
 * mimic a backend until real integration is available.
 */
const docsApi = {
  // PUBLIC_INTERFACE
  async listAll({ query = '', type = 'all' } = {}) {
    /** Return filtered list of document records grouped by assets and licenses. */
    await delay(140);
    const q = (query || '').trim().toLowerCase();
    let all = getDocs();
    if (type !== 'all') {
      all = all.filter((d) => d.type === type);
    }
    if (q) {
      all = all.filter((d) =>
        [d.title, d.assetName, d.category, d.hash, d.id]
          .some((x) => String(x || '').toLowerCase().includes(q))
      );
    }
    return all;
  },

  // PUBLIC_INTERFACE
  async get(id) {
    /** Fetch a single document metadata record by id. */
    await delay(80);
    return getDocs().find((d) => d.id === id) || null;
  },

  // PUBLIC_INTERFACE
  async download(id) {
    /**
     * Simulate secure download by returning a Blob URL for a text file containing
     * the metadata. In a real backend, this would be an authenticated fetch to a
     * presigned URL or a streaming download.
     */
    await delay(240);
    const doc = getDocs().find((d) => d.id === id);
    if (!doc) throw new Error('Document not found');

    const content = [
      `Title: ${doc.title}`,
      `Type: ${doc.type}`,
      `Category: ${doc.category}`,
      `Asset: ${doc.assetName || '-'}`,
      `Status: ${doc.status}`,
      `Hash: ${doc.hash || '-'}`,
      `Issued At: ${doc.issuedAt}`,
      `Issuer: ${doc.issuer || 'Creator License Vault'}`,
      `Notes: ${doc.notes || '-'}`,
      `Doc ID: ${doc.id}`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    return { url, filename: buildFilename(doc) };
  }
};

export default docsApi;

// Helpers

function buildFilename(doc) {
  const safeTitle = (doc.title || 'document').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const ext = doc.type === 'proof' || doc.type === 'notarized_hash' ? 'txt' : 'pdf';
  return `${safeTitle}-${doc.id}.${ext}`;
}

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function getDocs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DOCS);
    if (!raw) {
      const seeded = seedDocs();
      setDocs(seeded);
      return seeded;
    }
    return JSON.parse(raw);
  } catch {
    const seeded = seedDocs();
    setDocs(seeded);
    return seeded;
  }
}

function setDocs(value) {
  try {
    localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(value));
  } catch {}
}

function seedDocs() {
  const now = () => new Date(Date.now() - Math.floor(Math.random() * 86400000 * 90)).toISOString();
  const mk = (id, type, title, category, status, assetName, hash, issuer = 'Creator License Vault') => ({
    id,
    type, // 'proof' | 'notarized_hash' | 'certificate' | 'agreement'
    title,
    category, // 'IP Proof', 'Blockchain', 'Verification', 'License'
    status, // 'valid' | 'expired' | 'revoked' | 'pending'
    assetName,
    hash,
    issuer,
    issuedAt: now(),
    notes: type === 'agreement'
      ? 'Counter-signed by both parties.'
      : type === 'certificate'
      ? 'Verification certificate with on-chain reference.'
      : 'Content includes hash and timestamp.',
  });

  return [
    mk('doc_1', 'proof', 'Authorship Proof - Neon City Poster #12', 'IP Proof', 'valid', 'Neon City Poster #12', '0x3a8c...f2b1'),
    mk('doc_2', 'notarized_hash', 'Notarized SHA-256 Hash - Aurora Gradient Pack', 'Blockchain', 'valid', 'Aurora Gradient Pack', '0xb71c...aa42'),
    mk('doc_3', 'certificate', 'Verification Certificate - Voxel Sculpture 3D', 'Verification', 'expired', 'Voxel Sculpture 3D', '0xc9d4...19ee'),
    mk('doc_4', 'agreement', 'Commercial License Agreement - Poster Series', 'License', 'valid', 'Neon City Poster #12', ''),
    mk('doc_5', 'agreement', 'Exclusive Campaign License - Aurora Gradient Pack', 'License', 'revoked', 'Aurora Gradient Pack', ''),
    mk('doc_6', 'certificate', 'Verification Certificate - Neon City Poster #12', 'Verification', 'valid', 'Neon City Poster #12', '0xdedc...9134'),
    mk('doc_7', 'proof', 'Authorship Proof - Voxel Sculpture 3D', 'IP Proof', 'valid', 'Voxel Sculpture 3D', '0xa11b...991a'),
  ];
}
