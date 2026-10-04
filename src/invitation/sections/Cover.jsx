import { useState } from 'react';
import { formatDots } from '../../lib/dates.js';
import { Flourish, WaxSeal } from '../components/decor.jsx';
import { orderedCouple } from '../components/ui.jsx';

// Full-screen envelope. Tapping anywhere folds the flap back and the
// envelope fades away to reveal the invitation underneath.
export default function Cover({ config, onOpen }) {
  const [opening, setOpening] = useState(false);
  const [first, second] = orderedCouple(config);
  const { cover, wedding, theme } = config;
  const envelope = theme.colors.envelope;

  const open = () => {
    if (opening) return;
    setOpening(true);
    onOpen?.('start');
    setTimeout(() => onOpen?.('done'), 1750);
  };

  return (
    <div
      className={`env ${opening ? 'is-opening' : ''}`}
      role="dialog"
      aria-label="Invitation cover"
      onClick={open}
      style={{ '--env': envelope, '--env-ink': theme.colors.envelopeInk }}
    >
      <div className="env__inside" />

      <div className="env__pocket">
        <div className="env__content">
          <Flourish className="env__flourish" />
          <p className="env__tagline">{cover.tagline}</p>
          {cover.showNames && (
            <p className="env__names">
              {first.shortName || first.name} <span>&amp;</span> {second.shortName || second.name}
            </p>
          )}
          <Flourish className="env__flourish env__flourish--flip" />
          {cover.showDate && <p className="env__date">{formatDots(wedding.date)}</p>}
        </div>
      </div>

      <div className="env__flap-wrap">
        <div className="env__flap" />
        <svg className="env__flap-edge" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polyline points="0,40 50,60 100,40" fill="none" vectorEffect="non-scaling-stroke" strokeWidth="2.2" />
          <polygon points="2.5,1.8 97.5,1.8 97.5,37.6 50,56 2.5,37.6" fill="none" vectorEffect="non-scaling-stroke" strokeWidth="0.9" />
        </svg>
      </div>

      <button
        className="env__seal"
        onClick={(e) => {
          e.stopPropagation();
          open();
        }} aria-label={cover.sealText || 'Open invitation'}>
        <WaxSeal text={cover.sealText} />
      </button>
    </div>
  );
}
