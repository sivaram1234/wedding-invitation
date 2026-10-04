import crypto from 'node:crypto';
import { put } from '@vercel/blob';
import { blobConfigured, isAuthorized } from './_lib/auth.js';

const ALLOWED = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
  'audio/aac': 'aac',
  'audio/ogg': 'ogg',
};
// Vercel functions accept request bodies up to 4.5 MB; base64 adds ~33%.
const MAX_BYTES = 3_200_000;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!blobConfigured()) return res.status(503).json({ error: 'Blob storage is not configured' });
  if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' });

  const match = /^data:([\w/+.-]+);base64,(.+)$/s.exec(req.body?.dataUrl || '');
  const ext = match && ALLOWED[match[1]];
  if (!ext) return res.status(400).json({ error: 'Unsupported file type' });

  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > MAX_BYTES) return res.status(413).json({ error: 'File is larger than 3 MB' });

  try {
    const folder = match[1].startsWith('audio/') ? 'music' : 'images';
    const blob = await put(`uploads/${folder}/${crypto.randomUUID()}.${ext}`, buffer, {
      access: 'public',
      contentType: match[1],
    });
    return res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error('upload failed', err);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
