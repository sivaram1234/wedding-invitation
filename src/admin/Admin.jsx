import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { normalizeConfig, setIn } from '../lib/configUtils.js';
import { clearDraft, clearToken, getServerStatus, getToken, loadConfig, loadDraft, login, saveConfig, saveDraft } from '../lib/store.js';
import { AdminContext } from './fields.jsx';
import {
  BackupPanel,
  BasicsPanel,
  EventsPanel,
  GalleryPanel,
  MusicPanel,
  RitualsPanel,
  RsvpContactPanel,
  SectionsPanel,
  StoryPanel,
  ThemePanel,
  UnionPanel,
  VenuePanel,
} from './panels.jsx';
import './admin.css';

const TABS = [
  { id: 'basics', label: 'Couple & Date', icon: '💑', panel: BasicsPanel, scroll: 'top' },
  { id: 'theme', label: 'Theme & Cover', icon: '🎨', panel: ThemePanel, scroll: 'top' },
  { id: 'sections', label: 'Sections', icon: '☰', panel: SectionsPanel },
  { id: 'union', label: 'Union & Countdown', icon: '💍', panel: UnionPanel, scroll: 'union' },
  { id: 'story', label: 'Our Journey', icon: '📖', panel: StoryPanel, scroll: 'story' },
  { id: 'events', label: 'Celebrations', icon: '🌼', panel: EventsPanel, scroll: 'events' },
  { id: 'rituals', label: 'Rituals', icon: '🪔', panel: RitualsPanel, scroll: 'rituals' },
  { id: 'gallery', label: 'Gallery', icon: '🖼️', panel: GalleryPanel, scroll: 'gallery' },
  { id: 'venue', label: 'Venue', icon: '📍', panel: VenuePanel, scroll: 'venue' },
  { id: 'rsvp', label: 'RSVP & Contact', icon: '✉️', panel: RsvpContactPanel, scroll: 'rsvp' },
  { id: 'music', label: 'Music', icon: '🎵', panel: MusicPanel },
  { id: 'backup', label: 'Backup', icon: '💾', panel: BackupPanel },
];

export default function Admin() {
  const [boot, setBoot] = useState({ loading: true });
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    document.title = 'Invitation Editor';
    (async () => {
      const status = await getServerStatus();
      const { config, mode } = await loadConfig();
      setBoot({ loading: false, status, published: config, mode });
      setAuthed(mode !== 'cloud' || Boolean(getToken()));
    })();
  }, []);

  if (boot.loading) return <div className="admin-boot">Loading editor…</div>;
  if (!authed) return <Login status={boot.status} onLogin={() => setAuthed(true)} />;
  return <Editor published={boot.published} mode={boot.mode} status={boot.status} onLogout={() => setAuthed(false)} />;
}

function Login({ status, onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(password);
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={submit}>
        <div className="admin-login__mono">💌</div>
        <h1>Invitation Editor</h1>
        <p>Enter the admin password to edit your invitation.</p>
        {!status.auth && <p className="a-alert">ADMIN_PASSWORD is not set on the server.</p>}
        <input className="a-input" type="password" autoFocus autoComplete="current-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="a-alert">{error}</p>}
        <button className="a-btn a-btn--primary" disabled={busy || !password}>
          {busy ? 'Checking…' : 'Unlock'}
        </button>
        <a className="a-link" href="/">
          ← Back to invitation
        </a>
      </form>
    </div>
  );
}

function Editor({ published, mode, status, onLogout }) {
  const [draft, setDraft] = useState(published);
  const [saved, setSaved] = useState(() => JSON.stringify(published));
  const [tab, setTab] = useState('basics');
  const [device, setDevice] = useState('mobile');
  const [showCover, setShowCover] = useState(false);
  const [toast, setToast] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const draftLoaded = useRef(false);

  const dirty = useMemo(() => JSON.stringify(draft) !== saved, [draft, saved]);

  const notify = useCallback((message, kind = 'ok') => {
    setToast({ message, kind, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const onError = useCallback(
    (err) => {
      notify(err.message || 'Something went wrong', 'error');
      if (err.unauthorized) {
        clearToken();
        onLogout();
      }
    },
    [notify, onLogout],
  );

  // Restore unpublished edits from a previous session.
  useEffect(() => {
    loadDraft().then((d) => {
      if (d && JSON.stringify(d) !== saved) {
        setDraft(normalizeConfig(d));
        notify('Restored your unpublished changes');
      }
      draftLoaded.current = true;
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!draftLoaded.current) return;
    const t = setTimeout(() => (dirty ? saveDraft(draft) : clearDraft()), 500);
    return () => clearTimeout(t);
  }, [draft, dirty]);

  useEffect(() => {
    const warn = (e) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = useCallback((path, value) => setDraft((d) => setIn(d, path, value)), []);

  const publish = async () => {
    setPublishing(true);
    try {
      await saveConfig(draft, mode);
      setSaved(JSON.stringify(draft));
      await clearDraft();
      notify(mode === 'cloud' ? 'Published! Guests will see the changes now.' : 'Saved in this browser.');
    } catch (err) {
      onError(err);
    } finally {
      setPublishing(false);
    }
  };

  const discard = () => {
    if (!window.confirm('Discard all unpublished changes?')) return;
    setDraft(JSON.parse(saved));
    clearDraft();
  };

  const reset = () => {
    if (window.confirm('Replace everything in the editor with the sample invitation?')) setDraft(normalizeConfig(null));
  };

  const active = TABS.find((t) => t.id === tab);
  const Panel = active.panel;

  return (
    <AdminContext.Provider value={{ mode, onError }}>
      <div className="admin">
        <header className="admin__bar">
          <div className="admin__brand">
            <span>💌</span>
            <strong>Invitation Editor</strong>
            <span className={`a-badge a-badge--${mode}`} title={mode === 'cloud' ? 'Changes are published for all guests' : 'Cloud storage not configured; saves stay in this browser'}>
              {mode === 'cloud' ? 'Cloud' : 'Local mode'}
            </span>
          </div>
          <div className="admin__actions">
            {dirty && <span className="a-dirty">Unpublished changes</span>}
            {dirty && (
              <button className="a-btn a-btn--text" onClick={discard}>
                Discard
              </button>
            )}
            <button className="a-btn a-hide-desktop" onClick={() => setPreviewOpen(true)}>
              Preview
            </button>
            <a className="a-btn a-hide-mobile" href="/" target="_blank" rel="noreferrer">
              View site ↗
            </a>
            <button className="a-btn a-btn--primary" onClick={publish} disabled={!dirty || publishing}>
              {publishing ? 'Publishing…' : mode === 'cloud' ? 'Publish' : 'Save'}
            </button>
            {mode === 'cloud' && (
              <button
                className="a-btn a-btn--text a-hide-mobile"
                onClick={() => {
                  clearToken();
                  onLogout();
                }}
              >
                Log out
              </button>
            )}
          </div>
        </header>

        {mode === 'local' && status && !status.cloud && (
          <div className="a-banner">
            {status.blob || status.auth
              ? 'Cloud storage is partly configured. Set both ADMIN_PASSWORD and a Vercel Blob store to publish for guests.'
              : 'Local mode: edits are saved in this browser only. Deploy to Vercel with ADMIN_PASSWORD and a Blob store to publish for guests (see README).'}
          </div>
        )}

        <div className="admin__body">
          <nav className="admin__tabs" aria-label="Editor sections">
            {TABS.map((t) => (
              <button key={t.id} className={`admin__tab ${t.id === tab ? 'is-active' : ''}`} onClick={() => setTab(t.id)}>
                <span aria-hidden="true">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>

          <main className="admin__panel">
            <h2 className="admin__panel-title">{active.label}</h2>
            <Panel config={draft} set={set} replace={setDraft} onReset={reset} mode={mode} />
          </main>

          <aside className={`admin__preview ${previewOpen ? 'is-open' : ''}`}>
            <div className="admin__preview-bar">
              <div className="a-seg" role="group" aria-label="Preview device">
                <button className={device === 'mobile' ? 'is-active' : ''} onClick={() => setDevice('mobile')}>
                  📱 Mobile
                </button>
                <button className={device === 'desktop' ? 'is-active' : ''} onClick={() => setDevice('desktop')}>
                  🖥 Desktop
                </button>
              </div>
              <label className="a-check">
                <input type="checkbox" checked={showCover} onChange={(e) => setShowCover(e.target.checked)} /> Show cover
              </label>
              <button className="a-btn a-hide-desktop" onClick={() => setPreviewOpen(false)}>
                Close
              </button>
            </div>
            <PreviewFrame config={draft} device={device} showCover={showCover} scrollTo={active.scroll} />
          </aside>
        </div>

        {toast && (
          <div key={toast.id} className={`a-toast a-toast--${toast.kind}`} role="status">
            {toast.message}
          </div>
        )}
      </div>
    </AdminContext.Provider>
  );
}

const DEVICES = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1366, height: 860 },
};

function PreviewFrame({ config, device, showCover, scrollTo }) {
  const wrap = useRef(null);
  const frame = useRef(null);
  const [ready, setReady] = useState(false);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const onMessage = (e) => {
      if (e.origin === window.location.origin && e.data?.type === 'invitation-preview-ready') setReady(true);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    const ro = new ResizeObserver(([entry]) => setBox({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(wrap.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      frame.current?.contentWindow?.postMessage({ type: 'invitation-preview', config, showCover }, window.location.origin);
    }, 120);
    return () => clearTimeout(t);
  }, [config, showCover, ready]);

  useEffect(() => {
    if (!ready || !scrollTo) return;
    const t = setTimeout(() => frame.current?.contentWindow?.postMessage({ type: 'invitation-scroll', id: scrollTo }, window.location.origin), 250);
    return () => clearTimeout(t);
  }, [scrollTo, ready]);

  const d = DEVICES[device];
  const pad = device === 'mobile' ? 28 : 16;
  const scale = box.w ? Math.min(1, (box.w - pad * 2) / d.width, (box.h - pad * 2) / d.height) : 0.5;

  return (
    <div ref={wrap} className="a-frame-wrap">
      <div className={`a-device a-device--${device}`} style={{ width: d.width * scale, height: d.height * scale }}>
        <iframe
          ref={frame}
          title="Invitation preview"
          src="/preview"
          style={{ width: d.width, height: d.height, transform: `scale(${scale})` }}
        />
      </div>
    </div>
  );
}
