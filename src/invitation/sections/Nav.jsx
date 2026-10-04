import { useEffect, useState } from 'react';
import { formatDots } from '../../lib/dates.js';
import { initials } from '../components/ui.jsx';

export default function Nav({ config, links, scrollRoot }) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [a, b] = initials(config);

  useEffect(() => {
    const target = scrollRoot || window;
    const onScroll = () => {
      const y = scrollRoot ? scrollRoot.scrollTop : window.scrollY;
      setSolid(y > 60);
    };
    onScroll();
    target.addEventListener('scroll', onScroll, { passive: true });
    return () => target.removeEventListener('scroll', onScroll);
  }, [scrollRoot]);

  const go = (id) => (e) => {
    e.preventDefault();
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className={`nav ${solid ? 'is-solid' : ''} ${open ? 'is-open' : ''}`}>
      <a href="#top" className="nav__mono" onClick={go('top')}>
        {a} <i>·</i> {b}
      </a>
      <span className="nav__date">{formatDots(config.wedding.date)}</span>
      <button className="nav__toggle" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
        <span />
        <span />
      </button>
      <nav className="nav__links">
        {links.map((l) => (
          <a key={l.id} href={`#${l.id}`} onClick={go(l.id)}>
            {l.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
