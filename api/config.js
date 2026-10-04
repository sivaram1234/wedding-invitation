import { put, list, del } from '@vercel/blob';
import { blobConfigured, isAuthorized } from './_lib/auth.js';

const PREFIX = 'config/';
const KEEP_VERSIONS = 15;
const MAX_BYTES = 1_000_000;

async function versions() {
  const { blobs } = await list({ prefix: PREFIX, limit: 1000 });
  return blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!blobConfigured()) return res.status(200).json({ config: null });

  try {
    if (req.method === 'GET') {
      const [latest] = await versions();
      if (!latest) return res.status(200).json({ config: null });
      const r = await fetch(latest.url, { cache: 'no-store' });
      return res.status(200).json({ config: await r.json(), updatedAt: latest.uploadedAt });
    }

    if (req.method === 'PUT') {
      if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' });
      const config = req.body?.config;
      if (!config || typeof config !== 'object' || Array.isArray(config)) {
        return res.status(400).json({ error: 'Invalid config' });
      }
      const body = JSON.stringify(config);
      if (body.length > MAX_BYTES) {
        return res.status(413).json({ error: 'Config too large. Upload images instead of pasting data URLs.' });
      }
      // Each save is a new immutable file, so guests never get a stale CDN copy.
      await put(`${PREFIX}config-${Date.now()}.json`, body, {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: true,
      });
      const old = (await versions()).slice(KEEP_VERSIONS);
      if (old.length) await del(old.map((b) => b.url));
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('config handler failed', err);
    return res.status(500).json({ error: 'Storage error' });
  }
}
