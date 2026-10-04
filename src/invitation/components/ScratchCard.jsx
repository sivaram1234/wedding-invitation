import { useCallback, useEffect, useRef, useState } from 'react';

// A golden foil layer over the card that guests rub away with a finger or mouse.
export default function ScratchCard({ children, label = 'Scratch to reveal', enabled = true, accent = '#c9973f' }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);
  const moves = useRef(0);
  const [revealed, setRevealed] = useState(!enabled);

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { width, height } = wrap.getBoundingClientRect();
    if (!width || !height) return;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';

    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, shade(accent, 0.25));
    g.addColorStop(0.35, shade(accent, -0.05));
    g.addColorStop(0.5, shade(accent, 0.45));
    g.addColorStop(0.65, shade(accent, -0.05));
    g.addColorStop(1, shade(accent, 0.2));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);

    // Fine sparkle texture so it reads as foil rather than flat paint.
    for (let i = 0; i < (width * height) / 90; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.22})`;
      ctx.fillRect(Math.random() * width, Math.random() * height, 1.2, 1.2);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 1;
    ctx.strokeRect(10.5, 10.5, width - 21, height - 21);

    ctx.fillStyle = 'rgba(60,35,10,0.72)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const family = getComputedStyle(wrap).getPropertyValue('--font-heading') || 'serif';
    ctx.font = `600 ${Math.max(15, Math.min(22, width / 14))}px ${family}`;
    ctx.fillText('✦  ' + label + '  ✦', width / 2, height / 2);
  }, [accent, label]);

  useEffect(() => {
    if (revealed) return;
    paint();
    const ro = new ResizeObserver(() => paint());
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [paint, revealed]);

  useEffect(() => setRevealed(!enabled), [enabled]);

  const point = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const scratch = (e) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const p = point(e);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 38;
    ctx.beginPath();
    ctx.moveTo(last.current?.x ?? p.x, last.current?.y ?? p.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    if (++moves.current % 12 === 0) checkCleared();
  };

  const checkCleared = () => {
    const canvas = canvasRef.current;
    const { data } = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    let clear = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * 24) {
      total++;
      if (data[i] < 40) clear++;
    }
    if (clear / total > 0.45) setRevealed(true);
  };

  return (
    <div ref={wrapRef} className={`scratch ${revealed ? 'is-revealed' : ''}`}>
      <div className="scratch__content" aria-hidden={!revealed}>
        {children}
      </div>
      {!revealed && (
        <>
          <canvas
            ref={canvasRef}
            className="scratch__foil"
            onPointerDown={(e) => {
              drawing.current = true;
              last.current = null;
              e.currentTarget.setPointerCapture(e.pointerId);
              scratch(e);
            }}
            onPointerMove={scratch}
            onPointerUp={() => {
              drawing.current = false;
              checkCleared();
            }}
            onPointerCancel={() => (drawing.current = false)}
          />
          <button className="scratch__skip" onClick={() => setRevealed(true)}>
            Tap to reveal
          </button>
        </>
      )}
    </div>
  );
}

// Lighten (amount > 0) or darken (amount < 0) a hex colour.
function shade(hex, amount) {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  if (!m) return hex;
  const mix = (c) => {
    const v = parseInt(c, 16);
    const out = amount >= 0 ? v + (255 - v) * amount : v * (1 + amount);
    return Math.round(Math.max(0, Math.min(255, out)))
      .toString(16)
      .padStart(2, '0');
  };
  return `#${mix(m[1])}${mix(m[2])}${mix(m[3])}`;
}
