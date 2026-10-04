import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval';
import { normalizeConfig } from './configUtils.js';

// Two storage modes:
//  - cloud: deployed on Vercel with a Blob store; edits are published for every guest.
//  - local: no API available (plain `npm run dev`); edits live in this browser's IndexedDB.

const LOCAL_KEY = 'invitation-config';
const TOKEN_KEY = 'invitation-admin-token';

async function fetchJson(url, options) {
  const res = await fetch(url, { cache: 'no-store', ...options });
  const type = res.headers.get('content-type') || '';
  // Without the API, the dev server answers /api/* with index.html.
  if (!type.includes('application/json')) return { ok: false, status: res.status, data: null };
  return { ok: res.ok, status: res.status, data: await res.json() };
}

let statusPromise;
export function getServerStatus() {
  statusPromise ??= fetchJson('/api/status')
    .then((r) => (r.ok ? r.data : { cloud: false, auth: false }))
    .catch(() => ({ cloud: false, auth: false }));
  return statusPromise;
}

export async function loadConfig() {
  const status = await getServerStatus();
  if (status.cloud) {
    try {
      const r = await fetchJson('/api/config');
      if (r.ok && r.data?.config) return { config: normalizeConfig(r.data.config), mode: 'cloud' };
    } catch {
      /* fall through to static / local copies */
    }
  }
  try {
    const local = await idbGet(LOCAL_KEY);
    if (local) return { config: normalizeConfig(local), mode: status.cloud ? 'cloud' : 'local' };
  } catch {
    /* IndexedDB unavailable (private mode) */
  }
  try {
    // Optional: a config exported from /admin and committed as public/config.json.
    const r = await fetchJson('/config.json');
    if (r.ok && r.data) return { config: normalizeConfig(r.data), mode: status.cloud ? 'cloud' : 'local' };
  } catch {
    /* none committed */
  }
  return { config: normalizeConfig(null), mode: status.cloud ? 'cloud' : 'local' };
}

export function getToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export async function login(password) {
  const r = await fetchJson('/api/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!r.ok) throw new Error(r.data?.error || 'Login failed');
  sessionStorage.setItem(TOKEN_KEY, r.data.token);
  return r.data.token;
}

function authHeaders() {
  return { 'content-type': 'application/json', authorization: `Bearer ${getToken() || ''}` };
}

export async function saveConfig(config, mode) {
  if (mode === 'cloud') {
    const r = await fetchJson('/api/config', { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ config }) });
    if (r.status === 401) throw Object.assign(new Error('Session expired. Please log in again.'), { unauthorized: true });
    if (!r.ok) throw new Error(r.data?.error || 'Could not publish changes');
    return;
  }
  await idbSet(LOCAL_KEY, config);
}

export async function clearLocalConfig() {
  await idbDel(LOCAL_KEY);
}

// Uploads a data URL to the Blob store (cloud) or keeps it inline (local).
export async function storeFile(dataUrl, mode, filename = 'file') {
  if (mode !== 'cloud') return dataUrl;
  const r = await fetchJson('/api/upload', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ dataUrl, filename }) });
  if (r.status === 401) throw Object.assign(new Error('Session expired. Please log in again.'), { unauthorized: true });
  if (!r.ok) throw new Error(r.data?.error || 'Upload failed');
  return r.data.url;
}

// Unpublished edits are kept in IndexedDB so a refresh or closed tab loses nothing.
const DRAFT_KEY = 'invitation-draft';

export async function loadDraft() {
  try {
    return (await idbGet(DRAFT_KEY)) || null;
  } catch {
    return null;
  }
}

export async function saveDraft(config) {
  try {
    await idbSet(DRAFT_KEY, config);
  } catch {
    /* best effort */
  }
}

export async function clearDraft() {
  try {
    await idbDel(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}
