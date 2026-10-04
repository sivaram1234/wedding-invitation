import defaultConfig from '../config/defaultConfig.js';
import { THEME_PRESETS } from '../config/themes.js';

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

// Saved configs are merged over the defaults so fields added in later versions
// of the site still have sensible values. Arrays are replaced, not merged.
export function deepMerge(base, override) {
  if (!isPlainObject(override)) return override === undefined ? base : override;
  const out = { ...base };
  for (const [key, value] of Object.entries(override)) {
    out[key] = isPlainObject(base?.[key]) && isPlainObject(value) ? deepMerge(base[key], value) : value;
  }
  return out;
}

export function normalizeConfig(saved) {
  const merged = deepMerge(structuredClone(defaultConfig), saved || {});
  // Configs saved before envelope colours existed: take them from their own preset.
  const savedColors = saved?.theme?.colors;
  if (savedColors && !savedColors.envelope) {
    const preset = THEME_PRESETS[saved.theme.preset] || THEME_PRESETS.marigold;
    merged.theme.colors.envelope = preset.colors.envelope;
    merged.theme.colors.envelopeInk = preset.colors.envelopeInk;
  }
  // Version 2 returned to the original, calmer background: switch off the
  // extra decorations that version 1 enabled by default.
  if (saved && (saved.version ?? 1) < 2) {
    Object.assign(merged.theme, { emboss: false, florals: false, sparkles: false, portraitFrame: 'classic' });
  }
  merged.version = defaultConfig.version;
  // Keep any sections introduced after the config was saved.
  const known = new Set(merged.sections.map((s) => s.id));
  defaultConfig.sections.forEach((s) => {
    if (!known.has(s.id)) merged.sections.push({ ...s });
  });
  merged.sections = merged.sections.filter((s) => defaultConfig.sections.some((d) => d.id === s.id));
  return merged;
}

// Immutable update of a nested value, e.g. setIn(cfg, 'couple.bride.name', 'Asha').
export function setIn(obj, path, value) {
  const keys = Array.isArray(path) ? path : path.split('.');
  if (!keys.length) return value;
  const [head, ...rest] = keys;
  const clone = Array.isArray(obj) ? [...obj] : { ...obj };
  clone[head] = setIn(obj?.[head] ?? {}, rest, value);
  return clone;
}

export function getIn(obj, path) {
  return path.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
}
