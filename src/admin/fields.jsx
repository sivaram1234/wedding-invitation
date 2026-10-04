import { createContext, useContext, useId, useRef, useState } from 'react';
import { compressImage, readAsDataUrl } from '../lib/files.js';
import { storeFile } from '../lib/store.js';

export const AdminContext = createContext({ mode: 'local', onError: () => {} });

export function Card({ title, hint, children, actions }) {
  return (
    <section className="a-card">
      {(title || actions) && (
        <header className="a-card__head">
          <div>
            {title && <h3>{title}</h3>}
            {hint && <p className="a-hint">{hint}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className="a-card__body">{children}</div>
    </section>
  );
}

export function Field({ label, hint, children, wide }) {
  const id = useId();
  return (
    <div className={`a-field ${wide ? 'a-field--wide' : ''}`}>
      {label && <label htmlFor={id}>{label}</label>}
      {typeof children === 'function' ? children(id) : children}
      {hint && <p className="a-hint">{hint}</p>}
    </div>
  );
}

export function Text({ label, hint, value, onChange, wide, ...rest }) {
  return (
    <Field label={label} hint={hint} wide={wide}>
      {(id) => <input id={id} className="a-input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...rest} />}
    </Field>
  );
}

export function TextArea({ label, hint, value, onChange, rows = 3, wide = true }) {
  return (
    <Field label={label} hint={hint} wide={wide}>
      {(id) => <textarea id={id} className="a-input" rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />}
    </Field>
  );
}

export function Select({ label, hint, value, onChange, options, wide }) {
  return (
    <Field label={label} hint={hint} wide={wide}>
      {(id) => (
        <select id={id} className="a-input" value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => {
            const [v, l] = Array.isArray(o) ? o : [o, o];
            return (
              <option key={v} value={v}>
                {l}
              </option>
            );
          })}
        </select>
      )}
    </Field>
  );
}

export function Toggle({ label, hint, checked, onChange }) {
  return (
    <label className="a-toggle">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="a-toggle__track" aria-hidden="true" />
      <span>
        <span className="a-toggle__label">{label}</span>
        {hint && <span className="a-hint">{hint}</span>}
      </span>
    </label>
  );
}

export function Color({ label, value, onChange }) {
  return (
    <Field label={label}>
      {(id) => (
        <div className="a-color">
          <input id={id} type="color" value={value} onChange={(e) => onChange(e.target.value)} />
          <input className="a-input" value={value} onChange={(e) => onChange(e.target.value)} maxLength={7} aria-label={`${label} hex`} />
        </div>
      )}
    </Field>
  );
}

export function useUploader() {
  const { mode, onError } = useContext(AdminContext);
  const [busy, setBusy] = useState(false);
  const upload = async (file, opts) => {
    setBusy(true);
    try {
      const dataUrl = await compressImage(file, opts);
      return await storeFile(dataUrl, mode, file.name);
    } catch (err) {
      onError(err);
      return null;
    } finally {
      setBusy(false);
    }
  };
  return { upload, busy, mode };
}

export function ImageField({ label, hint, value, onChange, maxDim = 1800, shape = 'wide' }) {
  const input = useRef(null);
  const { upload, busy } = useUploader();
  const [showUrl, setShowUrl] = useState(false);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const url = await upload(file, { maxDim });
    if (url) onChange(url);
  };

  return (
    <Field label={label} hint={hint} wide>
      <div className="a-image">
        <button type="button" className={`a-image__thumb a-image__thumb--${shape}`} onClick={() => input.current.click()} disabled={busy}>
          {busy ? <span className="a-spinner" /> : value ? <img src={value} alt="" /> : <span>+ Add photo</span>}
        </button>
        <div className="a-image__actions">
          <button type="button" className="a-btn" onClick={() => input.current.click()} disabled={busy}>
            {busy ? 'Uploading…' : value ? 'Replace' : 'Upload'}
          </button>
          <button type="button" className="a-btn a-btn--text" onClick={() => setShowUrl((s) => !s)}>
            Paste URL
          </button>
          {value && (
            <button type="button" className="a-btn a-btn--text a-btn--danger" onClick={() => onChange('')}>
              Remove
            </button>
          )}
        </div>
        <input ref={input} type="file" accept="image/*" hidden onChange={onFile} />
      </div>
      {showUrl && (
        <input
          className="a-input"
          placeholder="https://…"
          defaultValue={value?.startsWith('data:') ? '' : value}
          onBlur={(e) => e.target.value.trim() && onChange(e.target.value.trim())}
        />
      )}
    </Field>
  );
}

export function AudioField({ label, hint, value, onChange }) {
  const input = useRef(null);
  const { mode, onError } = useContext(AdminContext);
  const [busy, setBusy] = useState(false);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 3_000_000) return onError(new Error('Music file must be under 3 MB. Trim it or use a lower bitrate MP3, or paste a URL.'));
    setBusy(true);
    try {
      onChange(await storeFile(await readAsDataUrl(file), mode, file.name));
    } catch (err) {
      onError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Field label={label} hint={hint} wide>
      <div className="a-row">
        <input className="a-input" placeholder="https://… .mp3" value={value?.startsWith('data:') ? '(uploaded file)' : value || ''} onChange={(e) => onChange(e.target.value)} readOnly={value?.startsWith('data:')} />
        <button type="button" className="a-btn" onClick={() => input.current.click()} disabled={busy}>
          {busy ? 'Uploading…' : 'Upload MP3'}
        </button>
        {value && (
          <button type="button" className="a-btn a-btn--text a-btn--danger" onClick={() => onChange('')}>
            Remove
          </button>
        )}
      </div>
      {value && <audio className="a-audio" src={value} controls preload="none" />}
      <input ref={input} type="file" accept="audio/mpeg,audio/mp4,audio/aac,audio/ogg" hidden onChange={onFile} />
    </Field>
  );
}

// Generic repeatable list with add / remove / reorder.
export function ListEditor({ items, onChange, renderItem, newItem, addLabel = 'Add item', itemTitle }) {
  const update = (i, value) => onChange(items.map((it, j) => (j === i ? value : it)));
  const remove = (i) => onChange(items.filter((_, j) => j !== i));
  const move = (i, d) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <div className="a-list">
      {items.map((item, i) => (
        <div className="a-list__item" key={i}>
          <div className="a-list__head">
            <strong>{itemTitle ? itemTitle(item, i) : `#${i + 1}`}</strong>
            <div className="a-list__tools">
              <button type="button" className="a-icon" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                ↑
              </button>
              <button type="button" className="a-icon" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down">
                ↓
              </button>
              <button
                type="button"
                className="a-icon a-icon--danger"
                onClick={() => window.confirm('Remove this item?') && remove(i)}
                aria-label="Remove"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="a-grid">{renderItem(item, (patch) => update(i, { ...item, ...patch }), i)}</div>
        </div>
      ))}
      <button type="button" className="a-btn a-btn--dashed" onClick={() => onChange([...items, structuredClone(newItem)])}>
        + {addLabel}
      </button>
    </div>
  );
}
