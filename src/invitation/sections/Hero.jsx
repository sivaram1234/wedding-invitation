import { buildIcs, formatLongDate, formatTime, googleCalendarUrl } from '../../lib/dates.js';
import { downloadText } from '../../lib/files.js';
import { ArchFrame, Corners } from '../components/decor.jsx';
import { Divider, Mandala, orderedCouple } from '../components/ui.jsx';

export default function Hero({ config }) {
  const { hero, wedding, venue, theme } = config;
  const [first, second] = orderedCouple(config);
  const title = `Wedding of ${first.shortName || first.name} & ${second.shortName || second.name}`;
  const calendar = {
    title,
    date: wedding.date,
    time: wedding.time,
    utcOffset: wedding.utcOffset,
    location: [venue.name, venue.address].filter(Boolean).join(', '),
    details: hero.muhurtham,
  };
  const gcal = googleCalendarUrl(calendar);

  const downloadIcs = () => {
    const ics = buildIcs(calendar);
    if (ics) downloadText('wedding.ics', ics, 'text/calendar');
  };

  return (
    <section className={`hero ${hero.backgroundImage ? 'hero--image' : ''}`} id="top">
      {hero.backgroundImage && <div className="hero__bgimg" style={{ backgroundImage: `url("${hero.backgroundImage}")` }} aria-hidden="true" />}
      <Mandala className="hero__mandala hero__mandala--left" />
      <Mandala className="hero__mandala hero__mandala--right" />
      <Corners show={theme.florals} />
      <div className="hero__inner">
        <div className="hero__frame">
          <ArchFrame shape={theme.frame} florals={theme.florals} src={hero.image} alt={title} label="Your couple photo" />
        </div>

        <div className="hero__text">
          <p className="eyebrow hero__eyebrow">{hero.eyebrow}</p>
          <h1 className="hero__names">
            <span className="hero__name">{first.name}</span>
            <span className="hero__amp">&amp;</span>
            <span className="hero__name">{second.name}</span>
          </h1>
          <p className="hero__line">{hero.invitationLine}</p>
          <Divider />
          <p className="hero__date">{formatLongDate(wedding.date)}</p>
          <p className="hero__time">
            {formatTime(wedding.time)}
            {hero.muhurtham && <span> · {hero.muhurtham}</span>}
          </p>
          {hero.location && <p className="hero__loc">{hero.location}</p>}
          <div className="hero__actions">
            {gcal && (
              <a className="btn btn--primary" href={gcal} target="_blank" rel="noreferrer">
                Add to Google Calendar
              </a>
            )}
            <button className="btn btn--ghost" onClick={downloadIcs}>
              Save the date (.ics)
            </button>
          </div>
        </div>
      </div>
      <a className="hero__scroll" href="#main" aria-label="Scroll down">
        <span />
      </a>
    </section>
  );
}
