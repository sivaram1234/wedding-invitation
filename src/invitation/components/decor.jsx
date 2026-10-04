import { useState } from 'react';
import { Photo } from './ui.jsx';

/* ───────────── Embossed botanical pattern ─────────────
   A 240px tile of leafy sprigs. Rendering it three times (shadow, highlight,
   then the base colour on top) gives a letterpress / embossed paper look. */

const TILE = 240;
const SPRIGS = [
  { x: 22, y: 150, angle: -62, len: 92 },
  { x: 98, y: 92, angle: -28, len: 84 },
  { x: 222, y: 226, angle: -145, len: 88 },
  { x: 30, y: 74, angle: -84, len: 52 },
  { x: 132, y: 226, angle: -100, len: 70 },
  { x: 214, y: 120, angle: -118, len: 64 },
  { x: 64, y: 222, angle: -20, len: 50 },
  { x: 170, y: 30, angle: 160, len: 48 },
];
const FLOWERS = [
  [196, 160, 6],
  [74, 30, 5.5],
  [150, 150, 5],
  [26, 200, 4.5],
  [226, 52, 4.5],
  [110, 182, 3.8],
];

function sprigPath({ x, y, angle, len }) {
  const a = (angle * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const nx = -dy;
  const ny = dx;
  const bend = len * 0.12;
  const at = (t) => {
    const off = Math.sin(t * Math.PI) * bend;
    return [x + dx * len * t + nx * off, y + dy * len * t + ny * off];
  };
  const [mx, my] = at(0.5);
  const [ex, ey] = at(1);
  const cx = 2 * mx - (x + ex) / 2;
  const cy = 2 * my - (y + ey) / 2;
  let d = `<path d='M${x},${y} Q${cx.toFixed(1)},${cy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}' fill='none' stroke='C' stroke-width='1.6' stroke-linecap='round'/>`;
  const leaves = Math.max(4, Math.round(len / 13));
  for (let i = 1; i <= leaves; i++) {
    const t = i / (leaves + 0.6);
    const [px, py] = at(t);
    const side = i % 2 ? 1 : -1;
    const deg = angle + side * 48;
    const s = 0.75 + (1 - t) * 0.45;
    d += `<path transform='translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${deg}) scale(${s.toFixed(2)})' d='M0,0 C4,-6 15,-7 22,0 C15,7 4,6 0,0Z' fill='C'/>`;
  }
  d += `<circle cx='${ex.toFixed(1)}' cy='${ey.toFixed(1)}' r='2.6' fill='C'/>`;
  return d;
}

function flowerPath([x, y, r]) {
  let d = '';
  for (let i = 0; i < 5; i++) {
    d += `<ellipse cx='${x}' cy='${y - r}' rx='${r * 0.55}' ry='${r * 0.9}' transform='rotate(${i * 72} ${x} ${y})' fill='C'/>`;
  }
  return d;
}

const TILE_BODY = SPRIGS.map(sprigPath).join('') + FLOWERS.map(flowerPath).join('');

const tileUrl = (color) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${TILE}' height='${TILE}' viewBox='0 0 ${TILE} ${TILE}'>${TILE_BODY.replaceAll("'C'", `'${color}'`)}</svg>`,
  )}")`;

// Returns CSS background-image/position for an embossed pattern over a solid colour.
export function embossStyle(base, { light = 0.38, dark = 0.16, size = TILE } = {}) {
  return {
    backgroundImage: [tileUrl(base), tileUrl(`rgba(255,255,255,${light})`), tileUrl(`rgba(0,0,0,${dark})`)].join(','),
    backgroundPosition: '0 0, -1px -1px, 1px 1px',
    backgroundSize: `${size}px ${size}px`,
  };
}

/* ───────────── Ornaments ───────────── */

export function Flourish({ className = '' }) {
  const half = (
    <>
      <path d="M92,12 C80,2 64,4 63,12 C62,19 72,21 74,15 C75,11 70,10 69,13" />
      <path d="M63,12 C48,12 34,6 16,12 C24,10 30,14 36,14" />
      <path d="M50,9 C46,4 40,4 38,7" />
      <circle cx="10" cy="12" r="1.6" stroke="none" fill="currentColor" />
    </>
  );
  return (
    <svg className={`flourish ${className}`} viewBox="0 0 200 24" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
        {half}
        <g transform="translate(200 0) scale(-1 1)">{half}</g>
      </g>
      <path d="M100,19 C94,15 92,12 92,10 C92,8 94,7 95.5,7 C97,7 98.5,8 100,10 C101.5,8 103,7 104.5,7 C106,7 108,8 108,10 C108,12 106,15 100,19Z" fill="currentColor" />
    </svg>
  );
}

// Wobbly wax-seal outline, generated once.
const SEAL_PATH = (() => {
  const pts = [];
  const n = 36;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = 47 + Math.sin(a * 5) * 1.8 + Math.sin(a * 9 + 1) * 1.4 + (i % 7 === 0 ? 2.2 : 0);
    pts.push([50 + Math.cos(a) * r, 50 + Math.sin(a) * r]);
  }
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p = pts[(i + 1) % n];
    const q = pts[(i + 2) % n];
    d += ` Q${p[0].toFixed(1)},${p[1].toFixed(1)} ${((p[0] + q[0]) / 2).toFixed(1)},${((p[1] + q[1]) / 2).toFixed(1)}`;
  }
  return `${d}Z`;
})();

export function WaxSeal({ text }) {
  const words = (text || '').split(' ');
  return (
    <span className="wax">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <radialGradient id="wax-gold" cx="38%" cy="32%" r="75%">
            <stop offset="0" stopColor="#fbe7a8" />
            <stop offset="0.45" stopColor="#d9a845" />
            <stop offset="1" stopColor="#9c6b1c" />
          </radialGradient>
        </defs>
        <path d={SEAL_PATH} fill="url(#wax-gold)" />
        <circle cx="50" cy="50" r="35" fill="none" stroke="#8a5d14" strokeOpacity="0.55" strokeWidth="1.6" />
        <circle cx="50" cy="50" r="37.5" fill="none" stroke="#fff3c9" strokeOpacity="0.5" strokeWidth="0.8" />
      </svg>
      <span className="wax__text">
        {words.map((w, i) => (
          <span key={i} className={w.length <= 2 ? 'is-small' : ''}>
            {w}
          </span>
        ))}
      </span>
    </span>
  );
}

/* ───────────── Botanical corner sprig (illustrated) ───────────── */
export function FloralSprig({ className = '' }) {
  const leaves = [
    [40, 150, -70, 1.3],
    [62, 128, 20, 1.2],
    [70, 104, -60, 1.1],
    [96, 92, 15, 1.15],
    [104, 66, -45, 1],
    [128, 58, 10, 0.95],
    [20, 120, -110, 1],
    [118, 120, 40, 0.9],
  ];
  return (
    <svg className={`sprig ${className}`} viewBox="0 0 200 200" aria-hidden="true">
      <g fill="none" stroke="var(--leaf)" strokeWidth="1.6" strokeLinecap="round">
        <path d="M0,200 C30,170 50,140 70,104 C88,72 110,58 150,40" />
        <path d="M44,150 C70,140 96,132 124,124" />
        <path d="M22,178 C14,150 16,130 22,112" />
      </g>
      <g fill="var(--leaf)">
        {leaves.map(([x, y, r, s], i) => (
          <path key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} d="M0,0 C6,-9 22,-10 32,0 C22,10 6,9 0,0Z" opacity={0.75 + (i % 3) * 0.1} />
        ))}
      </g>
      {[
        [150, 40, 13],
        [126, 124, 10],
        [86, 84, 7],
      ].map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          {Array.from({ length: 5 }, (_, k) => (
            <ellipse key={k} cx="0" cy={-r * 0.95} rx={r * 0.62} ry={r} transform={`rotate(${k * 72})`} fill="var(--bloom)" />
          ))}
          <circle r={r * 0.38} fill="var(--accent)" />
        </g>
      ))}
      {[
        [24, 108],
        [168, 30],
        [58, 160],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.2" fill="var(--bloom)" />
      ))}
    </svg>
  );
}

export function Corners({ show = true }) {
  if (!show) return null;
  return (
    <>
      <FloralSprig className="corner corner--tl" />
      <FloralSprig className="corner corner--br" />
    </>
  );
}

/* ───────────── Photo frames ───────────── */
const FRAME_PATHS = {
  arch: 'M0,400 L0,150 A150,150 0 0 1 300,150 L300,400 Z',
  scalloped:
    'M0,400 L0,150 A44,44 0 0 1 20,77.5 A44,44 0 0 1 75,24.4 A44,44 0 0 1 150,5 A44,44 0 0 1 225,24.4 A44,44 0 0 1 280,77.5 A44,44 0 0 1 300,150 L300,400 Z',
  pointed: 'M0,400 L0,175 C0,120 50,95 95,72 C125,56 145,32 150,0 C155,32 175,56 205,72 C250,95 300,120 300,175 L300,400 Z',
  oval: 'M150,0 C233,0 300,90 300,200 C300,310 233,400 150,400 C67,400 0,310 0,200 C0,90 67,0 150,0 Z',
};
// Older saved configs used these names.
const FRAME_ALIASES = { temple: 'pointed', mandapa: 'scalloped' };

const maskFor = (path) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 400' preserveAspectRatio='none'><path d='${path}'/></svg>`,
  )}")`;

export function ArchFrame({ src, alt, label, shape = 'arch', florals = true, className = '' }) {
  const key = FRAME_PATHS[shape] ? shape : FRAME_ALIASES[shape] || 'arch';
  const path = FRAME_PATHS[key];
  const mask = maskFor(path);
  const outline = (cls, stroke, width, extra = {}) => (
    <svg className={`aframe__line ${cls}`} viewBox="0 0 300 400" preserveAspectRatio="none" aria-hidden="true">
      <path d={path} fill="none" style={{ stroke }} strokeWidth={width} vectorEffect="non-scaling-stroke" {...extra} />
    </svg>
  );
  return (
    <div className={`aframe aframe--${key} ${className}`}>
      {outline('aframe__line--dots', 'currentColor', 1.4, { strokeDasharray: '0.5 7', strokeLinecap: 'round' })}
      {outline('aframe__line--outer', 'currentColor', 1.2)}
      <div className="aframe__shadow">
        <div className="aframe__clip" style={{ WebkitMaskImage: mask, maskImage: mask }}>
          <Photo src={src} alt={alt} label={label} />
        </div>
      </div>
      {outline('aframe__line--band', 'var(--surface)', 9)}
      {outline('aframe__line--inner', 'currentColor', 1)}
      {florals && (
        <>
          <FloralSprig className="aframe__sprig aframe__sprig--left" />
          <FloralSprig className="aframe__sprig aframe__sprig--right" />
        </>
      )}
    </div>
  );
}

// Circular portrait inside a ring of leaves.
export function WreathFrame({ src, alt }) {
  const leaves = Array.from({ length: 30 }, (_, i) => i);
  return (
    <div className="wreath">
      <svg className="wreath__ring" viewBox="-100 -100 200 200" aria-hidden="true">
        <circle r="80" fill="none" stroke="var(--leaf)" strokeWidth="1.2" />
        <g fill="var(--leaf)">
          {leaves.map((i) => {
            const a = (i / leaves.length) * 360;
            const out = i % 2 ? 1 : -1;
            return (
              <path
                key={i}
                transform={`rotate(${a}) translate(0 -80) rotate(${90 + out * 40}) scale(${0.85 + (i % 3) * 0.1})`}
                d="M0,0 C4,-6 15,-7 22,0 C15,7 4,6 0,0Z"
                opacity={0.7 + (i % 3) * 0.1}
              />
            );
          })}
        </g>
        {[-60, 60, 180].map((a) => (
          <g key={a} transform={`rotate(${a}) translate(0 -82)`}>
            {Array.from({ length: 5 }, (_, k) => (
              <ellipse key={k} cy="-5" rx="3.6" ry="5.6" transform={`rotate(${k * 72})`} fill="var(--bloom)" />
            ))}
            <circle r="2.4" fill="var(--accent)" />
          </g>
        ))}
      </svg>
      <div className="wreath__photo">
        <Photo src={src} alt={alt} />
      </div>
    </div>
  );
}

/* ───────────── Twinkling stars ───────────── */
export function Sparkles({ count = 22 }) {
  const [stars] = useState(() =>
    Array.from({ length: count }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 6 + Math.random() * 10,
      delay: -Math.random() * 6,
      duration: 3 + Math.random() * 4,
    })),
  );
  return (
    <div className="sparkles" aria-hidden="true">
      {stars.map((s, i) => (
        <span
          key={i}
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
