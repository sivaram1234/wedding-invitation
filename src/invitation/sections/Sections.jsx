import { useEffect, useRef, useState } from 'react';
import { EVENT_ICONS } from '../../config/defaultConfig.js';
import { formatDayMonth, formatShortDate, formatTime, formatWeekday, googleCalendarUrl, toInstant } from '../../lib/dates.js';
import ScratchCard from '../components/ScratchCard.jsx';
import { ArchFrame, Corners, FloralSprig, WreathFrame } from '../components/decor.jsx';
import { Divider, Mandala, Photo, Reveal, SectionTitle, orderedCouple } from '../components/ui.jsx';

export function Countdown({ config }) {
  const { wedding, countdown } = config;
  const target = toInstant(wedding.date, wedding.time, wedding.utcOffset);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!target) return null;

  const diff = Math.max(0, target.getTime() - now);
  const units = [
    ['Days', Math.floor(diff / 86_400_000)],
    ['Hours', Math.floor(diff / 3_600_000) % 24],
    ['Minutes', Math.floor(diff / 60_000) % 60],
    ['Seconds', Math.floor(diff / 1000) % 60],
  ];

  return (
    <section className="section countdown" id="countdown">
      <Reveal className="countdown__card">
        {config.theme.florals && (
          <>
            <FloralSprig className="countdown__sprig countdown__sprig--left" />
            <FloralSprig className="countdown__sprig countdown__sprig--right" />
          </>
        )}
        <p className="eyebrow">{countdown.title}</p>
        {diff > 0 ? (
          <div className="countdown__grid">
            {units.map(([label, value]) => (
              <div className="countdown__unit" key={label}>
                <span className="countdown__value">{String(value).padStart(2, '0')}</span>
                <span className="countdown__label">{label}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="countdown__done">{countdown.doneText}</p>
        )}
      </Reveal>
    </section>
  );
}

export function Union({ config, number }) {
  const { union } = config;
  const people = orderedCouple(config);
  return (
    <section className="section union" id="union">
      <Corners show={config.theme.florals} />
      <SectionTitle number={number} title={union.title} />
      <div className="union__intro">
        <Reveal className="union__photo">
          <ArchFrame shape={config.theme.frame} florals={config.theme.florals} src={union.image} alt="The couple" label="Couple photo" />
        </Reveal>
        <Reveal className="union__text" delay={120}>
          <p className="dropcap">{union.text}</p>
        </Reveal>
      </div>
      <div className="couple">
        {people.map((p, i) => (
          <Reveal className="person" key={i} delay={i * 150}>
            <div className="person__photo">
              {config.theme.portraitFrame === 'classic' ? <Photo src={p.photo} alt={p.name} className="person__classic" /> : <WreathFrame src={p.photo} alt={p.name} />}
            </div>
            <h3 className="script person__name">{p.name}</h3>
            <p className="person__rel">{p.relation}</p>
            <p className="person__parents">{p.parents}</p>
          </Reveal>
        ))}
        <span className="couple__amp script" aria-hidden="true">
          &amp;
        </span>
      </div>
    </section>
  );
}

export function Story({ config, number }) {
  const { story } = config;
  return (
    <section className="section section--alt story" id="story">
      <SectionTitle number={number} title={story.title} />
      <ol className="timeline">
        {story.items.map((item, i) => (
          <Reveal as="li" className="timeline__item" key={i} delay={i * 80}>
            <span className="timeline__dot" aria-hidden="true" />
            <div className="timeline__card">
              {item.image && <Photo src={item.image} alt={item.title} className="timeline__img" />}
              <p className="timeline__date">{item.date}</p>
              <h3>{item.title}</h3>
              {item.text && <p>{item.text}</p>}
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

export function Events({ config, number }) {
  const { events, wedding, venue, theme } = config;
  return (
    <section className="section events" id="events">
      <SectionTitle number={number} title={events.title} subtitle={events.scratch ? events.subtitle : null} />
      <div className="events__grid">
        {events.items.map((ev, i) => {
          const cal = googleCalendarUrl({
            title: ev.name,
            date: ev.date,
            time: ev.time,
            utcOffset: wedding.utcOffset,
            location: ev.venue || venue.name,
          });
          return (
            <Reveal className="event" key={i} delay={i * 100}>
              <ScratchCard enabled={events.scratch} accent={theme.colors.accent}>
                <div className="event__body">
                  <span className="event__icon" aria-hidden="true">
                    {EVENT_ICONS[ev.icon] || ev.icon || '✦'}
                  </span>
                  <h3 className="event__name">{ev.name}</h3>
                  <p className="event__date">
                    <span>{formatWeekday(ev.date)}</span>
                    <strong>{formatDayMonth(ev.date)}</strong>
                    {ev.time && <span>{formatTime(ev.time)}</span>}
                  </p>
                  {ev.venue && <p className="event__venue">{ev.venue}</p>}
                  {ev.dressCode && <p className="event__dress">Dress code · {ev.dressCode}</p>}
                  {ev.note && <p className="event__note">{ev.note}</p>}
                  {cal && (
                    <a className="event__cal" href={cal} target="_blank" rel="noreferrer">
                      + Add to calendar
                    </a>
                  )}
                </div>
              </ScratchCard>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

export function Rituals({ config, number }) {
  const { rituals } = config;
  return (
    <section className="section section--alt rituals" id="rituals">
      <SectionTitle number={number} title={rituals.title} subtitle={rituals.intro} />
      <ol className="rituals__list">
        {rituals.items.map((r, i) => (
          <Reveal as="li" className="ritual" key={i} delay={(i % 6) * 60}>
            <span className="ritual__num">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h3>{r.title}</h3>
              {r.subtitle && <p>{r.subtitle}</p>}
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

export function Gallery({ config, number }) {
  const { gallery } = config;
  const [index, setIndex] = useState(null);
  const touchX = useRef(null);
  const images = gallery.images.filter((g) => g.src);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setIndex(null);
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, images.length]);

  if (!images.length) return null;
  const current = index !== null ? images[index] : null;

  return (
    <section className="section gallery" id="gallery">
      <SectionTitle number={number} title={gallery.title} />
      <div className="gallery__grid">
        {images.map((img, i) => (
          <Reveal key={i} delay={(i % 4) * 70}>
            <button className="gallery__item" onClick={() => setIndex(i)} aria-label={img.caption || `Open photo ${i + 1}`}>
              <Photo src={img.src} alt={img.caption} />
              {img.caption && <span className="gallery__cap">{img.caption}</span>}
            </button>
          </Reveal>
        ))}
      </div>
      {current && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => setIndex(null)}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 50) setIndex((i) => (i + (dx < 0 ? 1 : -1) + images.length) % images.length);
          }}
        >
          <img src={current.src} alt={current.caption || ''} onClick={(e) => e.stopPropagation()} />
          {current.caption && <p className="lightbox__cap">{current.caption}</p>}
          <button className="lightbox__close" aria-label="Close">
            ×
          </button>
          {images.length > 1 && (
            <>
              <button
                className="lightbox__nav lightbox__nav--prev"
                aria-label="Previous"
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex((i) => (i - 1 + images.length) % images.length);
                }}
              >
                ‹
              </button>
              <button
                className="lightbox__nav lightbox__nav--next"
                aria-label="Next"
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex((i) => (i + 1) % images.length);
                }}
              >
                ›
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}

export function Venue({ config, number }) {
  const { venue } = config;
  const query = venue.mapQuery || [venue.name, venue.address].filter(Boolean).join(', ');
  const embed = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
  return (
    <section className="section section--alt venue" id="venue">
      <SectionTitle number={number} title={venue.title} />
      <div className="venue__grid">
        <Reveal className="venue__card">
          {venue.image && <Photo src={venue.image} alt={venue.name} className="venue__img" />}
          <h3>{venue.name}</h3>
          <p className="venue__addr">{venue.address}</p>
          {venue.note && <p className="venue__note">{venue.note}</p>}
          <div className="venue__actions">
            <a className="btn btn--primary" href={directions} target="_blank" rel="noreferrer">
              Get directions
            </a>
            {venue.mapLink && (
              <a className="btn btn--ghost" href={venue.mapLink} target="_blank" rel="noreferrer">
                Open in Maps
              </a>
            )}
          </div>
        </Reveal>
        {query && (
          <Reveal className="venue__map" delay={120}>
            <iframe title={`Map of ${venue.name}`} src={embed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </Reveal>
        )}
      </div>
    </section>
  );
}

export function Rsvp({ config, number }) {
  const { rsvp, couple } = config;
  const [form, setForm] = useState({ name: '', guests: '1', attending: 'yes', message: '' });
  const phone = (rsvp.whatsapp || '').replace(/\D/g, '');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const send = (e) => {
    e.preventDefault();
    const lines = [
      `RSVP for ${couple.bride.shortName || couple.bride.name} & ${couple.groom.shortName || couple.groom.name}'s wedding`,
      `Name: ${form.name.trim()}`,
      form.attending === 'yes' ? `Attending: Yes, ${form.guests} guest(s)` : 'Attending: Sorry, can’t make it',
      form.message.trim() && `Message: ${form.message.trim()}`,
    ].filter(Boolean);
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
  };

  if (!phone) return null;
  return (
    <section className="section rsvp" id="rsvp">
      <Corners show={config.theme.florals} />
      <SectionTitle number={number} title={rsvp.title} subtitle={rsvp.text} />
      <Reveal as="form" className="rsvp__form" onSubmit={send}>
        <label>
          <span>Your name</span>
          <input required maxLength={80} value={form.name} onChange={set('name')} placeholder="Full name" />
        </label>
        <div className="rsvp__choices" role="radiogroup" aria-label="Attendance">
          {[
            ['yes', 'Joyfully accept'],
            ['no', 'Regretfully decline'],
          ].map(([v, label]) => (
            <label key={v} className={`chip ${form.attending === v ? 'is-active' : ''}`}>
              <input type="radio" name="attending" value={v} checked={form.attending === v} onChange={set('attending')} />
              {label}
            </label>
          ))}
        </div>
        {form.attending === 'yes' && (
          <label>
            <span>Number of guests</span>
            <select value={form.guests} onChange={set('guests')}>
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i + 1}>{i + 1}</option>
              ))}
            </select>
          </label>
        )}
        <label>
          <span>Blessings / message (optional)</span>
          <textarea rows={3} maxLength={500} value={form.message} onChange={set('message')} />
        </label>
        <button className="btn btn--primary" type="submit">
          {rsvp.buttonText}
        </button>
        {rsvp.deadline && <p className="rsvp__deadline">{rsvp.deadline}</p>}
      </Reveal>
    </section>
  );
}

export function Contact({ config, number }) {
  const { contact } = config;
  return (
    <section className="section section--alt contact" id="contact">
      <Corners show={config.theme.florals} />
      <SectionTitle number={number} title={contact.title} />
      <Reveal className="contact__card">
        <Mandala className="contact__mandala" />
        <p className="contact__hosts">{contact.hosts}</p>
        {contact.address && <p className="contact__addr">{contact.address}</p>}
        <div className="contact__phones">
          {contact.phones
            .filter((p) => p.number)
            .map((p, i) => (
              <a key={i} className="btn btn--ghost" href={`tel:${p.number.replace(/[^\d+]/g, '')}`}>
                {p.label ? `${p.label} · ` : ''}
                {p.number}
              </a>
            ))}
        </div>
        {contact.quote && (
          <blockquote className="contact__quote">
            <p>“{contact.quote}”</p>
            {contact.quoteBy && <cite>— {contact.quoteBy}</cite>}
          </blockquote>
        )}
      </Reveal>
    </section>
  );
}

export function Footer({ config }) {
  const { couple, footer, wedding } = config;
  const [first, second] = orderedCouple(config);
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;
  const share = () =>
    navigator
      .share({ title: config.meta.title, text: config.meta.description, url: window.location.origin })
      .catch(() => {});

  return (
    <footer className="footer">
      {config.theme.florals && (
        <div className="footer__florals" aria-hidden="true">
          <FloralSprig className="footer__sprig" />
          <FloralSprig className="footer__sprig footer__sprig--flip" />
        </div>
      )}
      <Divider />
      <p className="footer__names script">
        {first.shortName || first.name} &amp; {second.shortName || second.name}
      </p>
      <p className="footer__date">{formatShortDate(wedding.date)}</p>
      {couple.hashtag && <p className="footer__tag">{couple.hashtag}</p>}
      {canShare && (
        <button className="btn btn--ghost" onClick={share}>
          Share this invitation
        </button>
      )}
      <p className="footer__text">{footer.text}</p>
    </footer>
  );
}
