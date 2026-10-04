import { authConfigured, checkPassword, issueToken } from './_lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!authConfigured()) return res.status(503).json({ error: 'ADMIN_PASSWORD is not set on the server' });

  if (!checkPassword(req.body?.password)) {
    // Slow down password guessing.
    await new Promise((r) => setTimeout(r, 800));
    return res.status(401).json({ error: 'Incorrect password' });
  }
  return res.status(200).json({ token: issueToken() });
}
