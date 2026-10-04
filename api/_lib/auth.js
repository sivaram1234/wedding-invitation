import crypto from 'node:crypto';

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

const secret = () => crypto.createHash('sha256').update(`invitation-admin:${process.env.ADMIN_PASSWORD}`).digest();
const sign = (payload) => crypto.createHmac('sha256', secret()).update(payload).digest('base64url');

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export const authConfigured = () => Boolean(process.env.ADMIN_PASSWORD);

export function checkPassword(password) {
  return authConfigured() && typeof password === 'string' && safeEqual(password, process.env.ADMIN_PASSWORD);
}

// Stateless session token: "<expiry>.<hmac>". Changing ADMIN_PASSWORD invalidates all tokens.
export function issueToken() {
  const exp = String(Date.now() + TOKEN_TTL_MS);
  return `${exp}.${sign(exp)}`;
}

export function isAuthorized(req) {
  if (!authConfigured()) return false;
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const [exp, sig] = token.split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return safeEqual(sig, sign(exp));
}

export const blobConfigured = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
