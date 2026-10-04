import { useEffect, useMemo, useRef, useState } from 'react';
import { SECTION_LABELS } from '../config/defaultConfig.js';
import { Sparkles, embossStyle } from './components/decor.jsx';
import { MusicButton, Petals, useThemeVars } from './components/ui.jsx';
import Cover from './sections/Cover.jsx';
import Hero from './sections/Hero.jsx';
import Nav from './sections/Nav.jsx';
import { Contact, Countdown, Events, Footer, Gallery, Rituals, Rsvp, Story, Union, Venue } from './sections/Sections.jsx';
import './invitation.css';
import './decor.css';

const COMPONENTS = {
  countdown: Countdown,
  union: Union,
  story: Story,
  events: Events,
  rituals: Rituals,
  gallery: Gallery,
  venue: Venue,
  rsvp: Rsvp,
  contact: Contact,
};

// Sections hidden automatically when they have nothing to show.
function hasContent(id, config) {
  if (id === 'gallery') return config.gallery.images.some((g) => g.src);
  if (id === 'rsvp') return Boolean((config.rsvp.whatsapp || '').replace(/\D/g, ''));
  if (id === 'story') return config.story.items.length > 0;
  if (id === 'events') return config.events.items.length > 0;
  if (id === 'rituals') return config.rituals.items.length > 0;
  return true;
}

export default function Invitation({ config, preview = false, showCover = true }) {
  const themeVars = useThemeVars(config.theme);
  const { bgAlt, bg } = config.theme.colors;
  const emboss = config.theme.emboss;
  const style = useMemo(() => {
    if (!emboss) return themeVars;
    const alt = embossStyle(bgAlt, { light: 0.7, dark: 0.07 });
    const main = embossStyle(bg, { light: 0.8, dark: 0.045, size: 300 });
    return {
      ...themeVars,
      '--alt-image': alt.backgroundImage,
      '--alt-pos': alt.backgroundPosition,
      '--alt-size': alt.backgroundSize,
      '--main-image': main.backgroundImage,
      '--main-pos': main.backgroundPosition,
      '--main-size': main.backgroundSize,
    };
  }, [themeVars, emboss, bgAlt, bg]);
  const coverWanted = config.cover.enabled && showCover;
  const [coverState, setCoverState] = useState(coverWanted ? 'closed' : 'gone');
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => setCoverState(coverWanted ? 'closed' : 'gone'), [coverWanted]);

  useEffect(() => {
    if (!preview) {
      document.title = config.meta.title;
      document.querySelector('meta[name="description"]')?.setAttribute('content', config.meta.description);
    }
  }, [config.meta, preview]);

  useEffect(() => {
    document.documentElement.classList.toggle('scroll-locked', coverState !== 'gone');
    return () => document.documentElement.classList.remove('scroll-locked');
  }, [coverState]);

  const play = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  };

  const toggleMusic = () => {
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
    } else play();
  };

  // Without a cover there is no tap to start music, so wait for the first interaction.
  useEffect(() => {
    if (coverWanted || !config.music.url || !config.music.autoplay || preview) return;
    const start = () => play();
    window.addEventListener('pointerdown', start, { once: true });
    return () => window.removeEventListener('pointerdown', start);
  }, [coverWanted, config.music.url, config.music.autoplay, preview]);

  const onCover = (phase) => {
    if (phase === 'start') {
      setCoverState('opening');
      if (config.music.url && config.music.autoplay && !preview) play();
    } else setCoverState('gone');
  };

  const visible = config.sections.filter((s) => s.visible && COMPONENTS[s.id] && hasContent(s.id, config));
  let n = 0;
  const numbered = visible.map((s) => ({ ...s, number: s.id === 'countdown' ? null : String(++n).padStart(2, '0') }));
  const links = numbered.filter((s) => s.id !== 'countdown').map((s) => ({ id: s.id, label: config[s.id]?.title || SECTION_LABELS[s.id] }));

  const theme = config.theme;
  return (
    <div className={`inv ${theme.paperTexture ? 'inv--paper' : ''} ${emboss ? 'inv--emboss' : ''} ${coverState !== 'gone' ? 'inv--covered' : ''}`} style={style}>
      {theme.sparkles && <Sparkles />}
      {theme.petals && <Petals />}
      <Nav config={config} links={links} />
      <Hero config={config} />
      <main id="main">
        {numbered.map((s) => {
          const Component = COMPONENTS[s.id];
          return <Component key={s.id} config={config} number={s.number} />;
        })}
      </main>
      <Footer config={config} />

      {config.music.url && (
        <>
          <audio ref={audioRef} src={config.music.url} loop preload="none" onPause={() => setPlaying(false)} onPlay={() => setPlaying(true)} />
          <MusicButton audioRef={audioRef} playing={playing} onToggle={toggleMusic} onCover={coverState !== 'gone'} />
        </>
      )}

      {coverState !== 'gone' && <Cover config={config} onOpen={onCover} />}
    </div>
  );
}
