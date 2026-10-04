import { useEffect, useMemo, useRef, useState } from 'react';
import { googleFontsHref } from '../../config/themes.js';

export function useThemeVars(theme) {
  const { colors, fonts } = theme;
  useEffect(() => {
    const id = 'invitation-fonts';
    let link = document.getElementById(id);
    if (!link) {
      link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    const href = googleFontsHref(fonts);
    if (link.href !== href) link.href = href;
  }, [fonts]);

  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', colors.bg);
  }, [colors.bg]);

  const indic = "'Noto Serif Telugu', 'Noto Serif Devanagari', 'Noto Serif Tamil', 'Noto Serif Kannada'";
  return useMemo(() => ({
    '--bg': colors.bg,
    '--bg-alt': colors.bgAlt,
    '--surface': colors.surface,
    '--primary': colors.primary,
    '--accent': colors.accent,
    '--text': colors.text,
    '--muted': colors.muted,
    '--on-primary': colors.onPrimary,
    '--font-script': `'${fonts.script}', cursive`,
    '--font-heading': `'${fonts.heading}', ${indic}, Georgia, serif`,
    '--font-body': `'${fonts.body}', ${indic}, Georgia, serif`,
  }), [colors, fonts]);
}

// Fades children in the first time they scroll into view.
export function Reveal({ as: Tag = 'div', className = '', delay = 0, children, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return setShown(true);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`reveal ${shown ? 'is-shown' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}

export function Divider({ className = '' }) {
  return (
    <svg className={`divider ${className}`} viewBox="0 0 240 24" aria-hidden="true">
      <path d="M0 12 H92" stroke="currentColor" strokeWidth="0.8" />
      <path d="M148 12 H240" stroke="currentColor" strokeWidth="0.8" />
      <path d="M120 2 C126 8 126 16 120 22 C114 16 114 8 120 2 Z" fill="currentColor" />
      <path d="M104 12 C110 6 116 9 120 12 C116 15 110 18 104 12 Z" fill="currentColor" opacity="0.7" />
      <path d="M136 12 C130 6 124 9 120 12 C124 15 130 18 136 12 Z" fill="currentColor" opacity="0.7" />
      <circle cx="96" cy="12" r="2" fill="currentColor" />
      <circle cx="144" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

// A soft mandala used as a background ornament and as the photo placeholder.
export function Mandala({ className = '' }) {
  const petals = Array.from({ length: 16 }, (_, i) => i * 22.5);
  return (
    <svg className={`mandala ${className}`} viewBox="0 0 200 200" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="0.7">
        <circle cx="100" cy="100" r="96" />
        <circle cx="100" cy="100" r="88" strokeDasharray="2 4" />
        <circle cx="100" cy="100" r="22" />
        <circle cx="100" cy="100" r="12" />
        {petals.map((a) => (
          <g key={a} transform={`rotate(${a} 100 100)`}>
            <path d="M100 22 C112 44 112 62 100 78 C88 62 88 44 100 22 Z" />
            <path d="M100 40 C105 50 105 58 100 66 C95 58 95 50 100 40 Z" />
            <circle cx="100" cy="14" r="2.4" fill="currentColor" />
          </g>
        ))}
      </g>
    </svg>
  );
}

export function Photo({ src, alt = '', className = '', label }) {
  if (src) return <img className={`photo ${className}`} src={src} alt={alt} loading="lazy" decoding="async" />;
  return (
    <div className={`photo photo--placeholder ${className}`} role="img" aria-label={alt || 'Photo placeholder'}>
      <Mandala />
      {label && <span className="photo__label">{label}</span>}
    </div>
  );
}

export function SectionTitle({ number, title, subtitle }) {
  return (
    <Reveal className="section-title">
      {number && <span className="section-title__num">{number}</span>}
      <h2>{title}</h2>
      <Divider />
      {subtitle && <p className="section-title__sub">{subtitle}</p>}
    </Reveal>
  );
}

export function Petals({ count = 14 }) {
  const [petals] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      left: Math.random() * 100,
      delay: -Math.random() * 18,
      duration: 14 + Math.random() * 12,
      size: 10 + Math.random() * 12,
      sway: 20 + Math.random() * 50,
      hue: i % 3,
    })),
  );
  return (
    <div className="petals" aria-hidden="true">
      {petals.map((p, i) => (
        <span
          key={i}
          className={`petal petal--${p.hue}`}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.25,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--sway': `${p.sway}px`,
          }}
        />
      ))}
    </div>
  );
}

export function MusicButton({ audioRef, playing, onToggle, onCover }) {
  if (!audioRef) return null;
  return (
    <button className={`music-btn ${playing ? 'is-playing' : ''} ${onCover ? 'music-btn--cover' : ''}`} onClick={onToggle} aria-label={playing ? 'Pause music' : 'Play music'}>
      {playing ? (
        <span className="music-btn__bars" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
        </svg>
      )}
    </button>
  );
}

export function initials(config) {
  const { bride, groom, invitationOf } = config.couple;
  const a = (bride.shortName || bride.name || '?').trim()[0] || '?';
  const b = (groom.shortName || groom.name || '?').trim()[0] || '?';
  return invitationOf === 'groom' ? [b, a] : [a, b];
}

export function orderedCouple(config) {
  const { bride, groom, invitationOf } = config.couple;
  return invitationOf === 'groom' ? [groom, bride] : [bride, groom];
}
