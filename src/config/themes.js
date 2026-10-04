export const THEME_PRESETS = {
  marigold: {
    label: 'Marigold & Maroon',
    colors: { bg: '#fbf5ea', bgAlt: '#f4e8d4', surface: '#fffaf2', primary: '#7a1f2b', accent: '#c9973f', text: '#3b2418', muted: '#8a6e5a', onPrimary: '#fff8ec', envelope: '#8e2c36', envelopeInk: '#f6e3c2' },
    fonts: { script: 'Great Vibes', heading: 'Cormorant Garamond', body: 'Lora' },
  },
  blush: {
    label: 'Blush Rose',
    colors: { bg: '#fdf6f3', bgAlt: '#f6e6e0', surface: '#fffbf9', primary: '#9c4257', accent: '#c4976a', text: '#4a2c33', muted: '#93727a', onPrimary: '#fff7f5', envelope: '#e2aeab', envelopeInk: '#7b3a44' },
    fonts: { script: 'Parisienne', heading: 'Cormorant Garamond', body: 'EB Garamond' },
  },
  sage: {
    label: 'Sage Garden',
    colors: { bg: '#f6f5ee', bgAlt: '#e8ecdd', surface: '#fcfcf7', primary: '#4a6545', accent: '#b38e52', text: '#2d3829', muted: '#76826f', onPrimary: '#f8faf2', envelope: '#a8b89a', envelopeInk: '#3a4a33' },
    fonts: { script: 'Alex Brush', heading: 'Marcellus', body: 'Lora' },
  },
  royal: {
    label: 'Royal Red & Gold',
    colors: { bg: '#fff7ec', bgAlt: '#fbe9d0', surface: '#fffbf4', primary: '#9b1c1c', accent: '#d4a017', text: '#3d1a12', muted: '#8c6450', onPrimary: '#fff6e5', envelope: '#a5262b', envelopeInk: '#fbe9c6' },
    fonts: { script: 'Pinyon Script', heading: 'Cinzel', body: 'EB Garamond' },
  },
  midnight: {
    label: 'Royal Midnight',
    colors: { bg: '#141a2e', bgAlt: '#1b2240', surface: '#222a4a', primary: '#e3c27f', accent: '#d4a853', text: '#f3ead8', muted: '#aaa6ba', onPrimary: '#1a1f36', envelope: '#27305a', envelopeInk: '#e9d6a6' },
    fonts: { script: 'Great Vibes', heading: 'Cormorant Garamond', body: 'Jost' },
  },
  lavender: {
    label: 'Lavender Dusk',
    colors: { bg: '#f7f4fa', bgAlt: '#ebe4f2', surface: '#fdfbff', primary: '#5d3f7a', accent: '#b8956a', text: '#2f2438', muted: '#857a90', onPrimary: '#fbf8ff', envelope: '#b7a3cf', envelopeInk: '#46325e' },
    fonts: { script: 'Parisienne', heading: 'Cormorant Garamond', body: 'Jost' },
  },
};

export const FONT_OPTIONS = {
  script: ['Great Vibes', 'Parisienne', 'Alex Brush', 'Pinyon Script', 'Allura', 'Dancing Script'],
  heading: ['Cormorant Garamond', 'Playfair Display', 'Cinzel', 'Marcellus', 'Prata', 'Lora'],
  body: ['Lora', 'EB Garamond', 'Jost', 'Montserrat', 'Raleway', 'Cormorant Garamond'],
};

// Indic fonts are served with unicode-range subsets, so browsers only download
// them when text in that script (e.g. Telugu ritual names) appears on the page.
const INDIC_FONTS = ['Noto Serif Telugu', 'Noto Serif Devanagari', 'Noto Serif Tamil', 'Noto Serif Kannada'];

// Google Fonts rejects a whole request if any font is asked for a weight it
// doesn't have, so each family lists only the axes it actually ships.
const FONT_SPECS = {
  'Cormorant Garamond': 'ital,wght@0,400;0,500;0,600;1,400',
  'Playfair Display': 'ital,wght@0,400;0,500;0,600;1,400',
  Lora: 'ital,wght@0,400;0,500;0,600;1,400',
  'EB Garamond': 'ital,wght@0,400;0,500;0,600;1,400',
  Jost: 'ital,wght@0,300;0,400;0,500;1,400',
  Montserrat: 'ital,wght@0,300;0,400;0,500;1,400',
  Raleway: 'ital,wght@0,300;0,400;0,500;1,400',
  Cinzel: 'wght@400;500;600',
  'Dancing Script': 'wght@400;600',
};

export function googleFontsHref(fonts) {
  const families = [...new Set([fonts.script, fonts.heading, fonts.body])]
    .filter(Boolean)
    .map((f) => `family=${f.replace(/ /g, '+')}${FONT_SPECS[f] ? `:${FONT_SPECS[f]}` : ''}`);
  INDIC_FONTS.forEach((f) => families.push(`family=${f.replace(/ /g, '+')}:wght@400;600`));
  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;
}
