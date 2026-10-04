import { useRef } from 'react';
import { EVENT_ICONS, SECTION_LABELS } from '../config/defaultConfig.js';
import { FONT_OPTIONS, THEME_PRESETS } from '../config/themes.js';
import { normalizeConfig } from '../lib/configUtils.js';
import { downloadText } from '../lib/files.js';
import { AudioField, Card, Color, ImageField, ListEditor, Select, Text, TextArea, Toggle, useUploader } from './fields.jsx';

export function BasicsPanel({ config, set }) {
  const { couple, wedding, hero, meta } = config;
  const person = (who, title) => (
    <Card title={title}>
      <div className="a-grid">
        <Text label="Full name" value={couple[who].name} onChange={(v) => set(`couple.${who}.name`, v)} />
        <Text label="Short name" hint="Used on the cover & footer" value={couple[who].shortName} onChange={(v) => set(`couple.${who}.shortName`, v)} />
        <Text label="Relation" value={couple[who].relation} onChange={(v) => set(`couple.${who}.relation`, v)} />
        <Text label="Parents" value={couple[who].parents} onChange={(v) => set(`couple.${who}.parents`, v)} />
        <ImageField label="Portrait" shape="round" maxDim={900} value={couple[who].photo} onChange={(v) => set(`couple.${who}.photo`, v)} />
      </div>
    </Card>
  );

  return (
    <>
      <Card title="The wedding" hint="Date and time are in the venue's local time.">
        <div className="a-grid">
          <Text label="Date" type="date" value={wedding.date} onChange={(v) => set('wedding.date', v)} />
          <Text label="Time (muhurtham)" type="time" value={wedding.time} onChange={(v) => set('wedding.time', v)} />
          <Select
            label="Venue time zone"
            value={wedding.utcOffset}
            onChange={(v) => set('wedding.utcOffset', v)}
            options={[
              ['+05:30', 'India (IST, UTC+5:30)'],
              ['+04:00', 'UAE (UTC+4)'],
              ['+03:00', 'Saudi / Qatar (UTC+3)'],
              ['+08:00', 'Singapore / Malaysia (UTC+8)'],
              ['+00:00', 'UK winter (UTC)'],
              ['+01:00', 'UK summer / CET (UTC+1)'],
              ['-05:00', 'US Eastern (UTC-5)'],
              ['-08:00', 'US Pacific (UTC-8)'],
              ['+10:00', 'Australia East (UTC+10)'],
            ]}
          />
          <Select
            label="Whose invitation?"
            hint="Decides whose name appears first"
            value={couple.invitationOf}
            onChange={(v) => set('couple.invitationOf', v)}
            options={[
              ['bride', "Bride's family"],
              ['groom', "Groom's family"],
            ]}
          />
          <Text label="Hashtag" value={couple.hashtag} onChange={(v) => set('couple.hashtag', v)} />
        </div>
      </Card>
      {person('bride', 'Bride')}
      {person('groom', 'Groom')}
      <Card title="Hero (first screen)">
        <div className="a-grid">
          <Text label="Small heading" value={hero.eyebrow} onChange={(v) => set('hero.eyebrow', v)} />
          <Text label="Location line" value={hero.location} onChange={(v) => set('hero.location', v)} />
          <Text label="Invitation line" wide value={hero.invitationLine} onChange={(v) => set('hero.invitationLine', v)} />
          <Text label="Muhurtham / lagnam" wide value={hero.muhurtham} onChange={(v) => set('hero.muhurtham', v)} />
          <ImageField label="Main couple photo" hint="Portrait photos look best in the arch frame." shape="arch" value={hero.image} onChange={(v) => set('hero.image', v)} />
          <ImageField
            label="Background image (optional)"
            hint="A soft floral or venue photo shown faintly behind the first screen."
            value={hero.backgroundImage}
            onChange={(v) => set('hero.backgroundImage', v)}
          />
        </div>
      </Card>
      <Card title="Link preview" hint="Shown when the link is shared on WhatsApp and other apps.">
        <div className="a-grid">
          <Text label="Page title" wide value={meta.title} onChange={(v) => set('meta.title', v)} />
          <Text label="Description" wide value={meta.description} onChange={(v) => set('meta.description', v)} />
        </div>
      </Card>
    </>
  );
}

export function ThemePanel({ config, set }) {
  const { theme, cover } = config;
  const applyPreset = (key) => {
    const p = THEME_PRESETS[key];
    set('theme', { ...theme, preset: key, colors: { ...p.colors }, fonts: { ...p.fonts } });
  };
  const color = (key, label) => <Color label={label} value={theme.colors[key]} onChange={(v) => set(`theme.colors.${key}`, v)} />;

  return (
    <>
      <Card title="Theme presets" hint="Pick a starting point, then fine-tune colours and fonts below.">
        <div className="a-presets">
          {Object.entries(THEME_PRESETS).map(([key, p]) => (
            <button key={key} type="button" className={`a-preset ${theme.preset === key ? 'is-active' : ''}`} onClick={() => applyPreset(key)}>
              <span className="a-preset__swatch" style={{ background: p.colors.bg }}>
                <i style={{ background: p.colors.primary }} />
                <i style={{ background: p.colors.accent }} />
                <i style={{ background: p.colors.bgAlt }} />
              </span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </Card>
      <Card title="Colours">
        <div className="a-grid a-grid--3">
          {color('bg', 'Background')}
          {color('bgAlt', 'Alternate band')}
          {color('surface', 'Cards')}
          {color('primary', 'Primary')}
          {color('accent', 'Gold accent')}
          {color('onPrimary', 'Text on primary')}
          {color('text', 'Text')}
          {color('muted', 'Soft text')}
          {color('envelope', 'Envelope')}
          {color('envelopeInk', 'Envelope text')}
        </div>
      </Card>
      <Card title="Fonts">
        <div className="a-grid a-grid--3">
          <Select label="Script (names)" value={theme.fonts.script} onChange={(v) => set('theme.fonts.script', v)} options={FONT_OPTIONS.script} />
          <Select label="Headings" value={theme.fonts.heading} onChange={(v) => set('theme.fonts.heading', v)} options={FONT_OPTIONS.heading} />
          <Select label="Body text" value={theme.fonts.body} onChange={(v) => set('theme.fonts.body', v)} options={FONT_OPTIONS.body} />
        </div>
      </Card>
      <Card title="Photo frames">
        <div className="a-grid">
          <Select
            label="Main photos"
            value={theme.frame}
            onChange={(v) => set('theme.frame', v)}
            options={[
              ['arch', 'Round arch'],
              ['scalloped', 'Scalloped arch'],
              ['pointed', 'Pointed arch'],
              ['oval', 'Oval'],
            ]}
          />
          <Select
            label="Bride & groom portraits"
            value={theme.portraitFrame}
            onChange={(v) => set('theme.portraitFrame', v)}
            options={[
              ['wreath', 'Leaf wreath'],
              ['classic', 'Classic circle'],
            ]}
          />
        </div>
      </Card>
      <Card title="Decorations & animations">
        <div className="a-stack">
          <Toggle label="Embossed floral pattern" hint="Letterpress leaves on the background bands" checked={theme.emboss} onChange={(v) => set('theme.emboss', v)} />
          <Toggle label="Floral sprigs" hint="Flowers in corners and around photos" checked={theme.florals} onChange={(v) => set('theme.florals', v)} />
          <Toggle label="Twinkling stars" checked={theme.sparkles} onChange={(v) => set('theme.sparkles', v)} />
          <Toggle label="Falling petals" checked={theme.petals} onChange={(v) => set('theme.petals', v)} />
          <Toggle label="Paper texture" checked={theme.paperTexture} onChange={(v) => set('theme.paperTexture', v)} />
        </div>
      </Card>
      <Card title="Envelope cover" hint="The full-screen envelope guests tap to open. Turn on “Show cover” above the preview to see it.">
        <div className="a-stack">
          <Toggle label="Show envelope cover" checked={cover.enabled} onChange={(v) => set('cover.enabled', v)} />
          <Toggle label="Show names on the envelope" checked={cover.showNames} onChange={(v) => set('cover.showNames', v)} />
          <Toggle label="Show date on the envelope" checked={cover.showDate} onChange={(v) => set('cover.showDate', v)} />
        </div>
        <div className="a-grid">
          <Text label="Wax seal text" value={cover.sealText} onChange={(v) => set('cover.sealText', v)} />
          <Text label="Envelope heading" value={cover.tagline} onChange={(v) => set('cover.tagline', v)} />
        </div>
      </Card>
    </>
  );
}

export function SectionsPanel({ config, set }) {
  const { sections } = config;
  const move = (i, d) => {
    const next = [...sections];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    set('sections', next);
  };
  return (
    <Card title="Sections" hint="Show, hide and reorder sections. The hero and footer always stay in place.">
      <ul className="a-sections">
        {sections.map((s, i) => (
          <li key={s.id} className={s.visible ? '' : 'is-hidden'}>
            <Toggle label={config[s.id]?.title || SECTION_LABELS[s.id]} checked={s.visible} onChange={(v) => set(`sections.${i}.visible`, v)} />
            <div className="a-list__tools">
              <button type="button" className="a-icon" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                ↑
              </button>
              <button type="button" className="a-icon" onClick={() => move(i, 1)} disabled={i === sections.length - 1} aria-label="Move down">
                ↓
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p className="a-hint">Gallery and RSVP hide themselves automatically until they have photos or a WhatsApp number.</p>
    </Card>
  );
}

export function UnionPanel({ config, set }) {
  const { union, countdown } = config;
  return (
    <>
      <Card title="The Union">
        <div className="a-grid">
          <Text label="Section title" value={union.title} onChange={(v) => set('union.title', v)} />
          <TextArea label="Welcome message" rows={5} value={union.text} onChange={(v) => set('union.text', v)} />
          <ImageField label="Photo" hint="e.g. joined hands, mehendi, rings" shape="arch" value={union.image} onChange={(v) => set('union.image', v)} />
        </div>
        <p className="a-hint">Bride and groom names, parents and portraits are under “Couple & Date”.</p>
      </Card>
      <Card title="Countdown">
        <div className="a-grid">
          <Text label="Heading" value={countdown.title} onChange={(v) => set('countdown.title', v)} />
          <Text label="Message after the wedding" value={countdown.doneText} onChange={(v) => set('countdown.doneText', v)} />
        </div>
      </Card>
    </>
  );
}

export function StoryPanel({ config, set }) {
  const { story } = config;
  return (
    <Card title="Our Journey" hint="Milestones shown on a timeline.">
      <div className="a-grid">
        <Text label="Section title" value={story.title} onChange={(v) => set('story.title', v)} />
      </div>
      <ListEditor
        items={story.items}
        onChange={(v) => set('story.items', v)}
        newItem={{ date: '', title: '', text: '', image: '' }}
        addLabel="Add milestone"
        itemTitle={(it, i) => it.title || `Milestone ${i + 1}`}
        renderItem={(it, patch) => (
          <>
            <Text label="Date label" placeholder="06 May 2026" value={it.date} onChange={(v) => patch({ date: v })} />
            <Text label="Title" value={it.title} onChange={(v) => patch({ title: v })} />
            <TextArea label="Text" value={it.text} onChange={(v) => patch({ text: v })} />
            <ImageField label="Photo (optional)" value={it.image} maxDim={1200} onChange={(v) => patch({ image: v })} />
          </>
        )}
      />
    </Card>
  );
}

export function EventsPanel({ config, set }) {
  const { events } = config;
  return (
    <Card title="Celebrations" hint="Mehendi, haldi, sangeet, wedding, reception…">
      <div className="a-grid">
        <Text label="Section title" value={events.title} onChange={(v) => set('events.title', v)} />
        <Text label="Subtitle" value={events.subtitle} onChange={(v) => set('events.subtitle', v)} />
      </div>
      <div className="a-stack">
        <Toggle label="Scratch-to-reveal cards" hint="Guests rub a gold foil to reveal each event" checked={events.scratch} onChange={(v) => set('events.scratch', v)} />
      </div>
      <ListEditor
        items={events.items}
        onChange={(v) => set('events.items', v)}
        newItem={{ icon: 'flower', name: '', date: config.wedding.date, time: '10:00', venue: '', dressCode: '', note: '' }}
        addLabel="Add event"
        itemTitle={(it, i) => `${EVENT_ICONS[it.icon] || '✦'} ${it.name || `Event ${i + 1}`}`}
        renderItem={(it, patch) => (
          <>
            <Text label="Name" value={it.name} onChange={(v) => patch({ name: v })} />
            <Select label="Icon" value={it.icon} onChange={(v) => patch({ icon: v })} options={Object.entries(EVENT_ICONS).map(([k, e]) => [k, `${e} ${k}`])} />
            <Text label="Date" type="date" value={it.date} onChange={(v) => patch({ date: v })} />
            <Text label="Time" type="time" value={it.time} onChange={(v) => patch({ time: v })} />
            <Text label="Venue" value={it.venue} onChange={(v) => patch({ venue: v })} />
            <Text label="Dress code" value={it.dressCode} onChange={(v) => patch({ dressCode: v })} />
            <Text label="Note" wide value={it.note} onChange={(v) => patch({ note: v })} />
          </>
        )}
      />
    </Card>
  );
}

export function RitualsPanel({ config, set }) {
  const { rituals } = config;
  return (
    <Card title="Wedding Rituals" hint="Any language works — Telugu, Hindi, Tamil and Kannada fonts load automatically.">
      <div className="a-grid">
        <Text label="Section title" value={rituals.title} onChange={(v) => set('rituals.title', v)} />
        <Text label="Intro" value={rituals.intro} onChange={(v) => set('rituals.intro', v)} />
      </div>
      <ListEditor
        items={rituals.items}
        onChange={(v) => set('rituals.items', v)}
        newItem={{ title: '', subtitle: '' }}
        addLabel="Add ritual"
        itemTitle={(it, i) => it.title || `Ritual ${i + 1}`}
        renderItem={(it, patch) => (
          <>
            <Text label="Name" value={it.title} onChange={(v) => patch({ title: v })} />
            <Text label="Description" value={it.subtitle} onChange={(v) => patch({ subtitle: v })} />
          </>
        )}
      />
    </Card>
  );
}

export function GalleryPanel({ config, set }) {
  const { gallery } = config;
  const input = useRef(null);
  const { upload, busy } = useUploader();

  const addFiles = async (e) => {
    const files = [...(e.target.files || [])];
    e.target.value = '';
    const added = [];
    for (const file of files) {
      const src = await upload(file, { maxDim: 1600 });
      if (src) added.push({ src, caption: '' });
    }
    if (added.length) set('gallery.images', [...gallery.images, ...added]);
  };

  return (
    <Card
      title="Gallery"
      hint="Pre-wedding shoots, family moments, engagement photos."
      actions={
        <button type="button" className="a-btn a-btn--primary" onClick={() => input.current.click()} disabled={busy}>
          {busy ? 'Uploading…' : '+ Add photos'}
        </button>
      }
    >
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={addFiles} />
      <div className="a-grid">
        <Text label="Section title" value={gallery.title} onChange={(v) => set('gallery.title', v)} />
      </div>
      {gallery.images.length === 0 && <p className="a-empty">No photos yet. The gallery stays hidden until you add some.</p>}
      <ListEditor
        items={gallery.images}
        onChange={(v) => set('gallery.images', v)}
        newItem={{ src: '', caption: '' }}
        addLabel="Add single photo"
        itemTitle={(it, i) => it.caption || `Photo ${i + 1}`}
        renderItem={(it, patch) => (
          <>
            <ImageField label="Photo" value={it.src} maxDim={1600} onChange={(v) => patch({ src: v })} />
            <Text label="Caption (optional)" wide value={it.caption} onChange={(v) => patch({ caption: v })} />
          </>
        )}
      />
    </Card>
  );
}

export function VenuePanel({ config, set }) {
  const { venue } = config;
  return (
    <Card title="Venue">
      <div className="a-grid">
        <Text label="Section title" value={venue.title} onChange={(v) => set('venue.title', v)} />
        <Text label="Venue name" value={venue.name} onChange={(v) => set('venue.name', v)} />
        <TextArea label="Address" rows={2} value={venue.address} onChange={(v) => set('venue.address', v)} />
        <Text
          label="Map search"
          wide
          hint="What to search on Google Maps — a place name, address, plus code (e.g. V2X2+C63 Tadipatri) or lat,long."
          value={venue.mapQuery}
          onChange={(v) => set('venue.mapQuery', v)}
        />
        <Text label="Google Maps share link (optional)" wide placeholder="https://maps.app.goo.gl/…" value={venue.mapLink} onChange={(v) => set('venue.mapLink', v)} />
        <Text label="Note" wide value={venue.note} onChange={(v) => set('venue.note', v)} />
        <ImageField label="Venue photo (optional)" value={venue.image} onChange={(v) => set('venue.image', v)} />
      </div>
    </Card>
  );
}

export function RsvpContactPanel({ config, set }) {
  const { rsvp, contact } = config;
  return (
    <>
      <Card title="RSVP" hint="Guests fill a short form that opens WhatsApp with their reply. No guest data is stored on this site.">
        <div className="a-grid">
          <Text label="Section title" value={rsvp.title} onChange={(v) => set('rsvp.title', v)} />
          <Text label="WhatsApp number" hint="With country code, e.g. 919876543210. Leave empty to hide RSVP." value={rsvp.whatsapp} onChange={(v) => set('rsvp.whatsapp', v)} />
          <TextArea label="Text" rows={2} value={rsvp.text} onChange={(v) => set('rsvp.text', v)} />
          <Text label="Deadline line" value={rsvp.deadline} onChange={(v) => set('rsvp.deadline', v)} />
          <Text label="Button text" value={rsvp.buttonText} onChange={(v) => set('rsvp.buttonText', v)} />
        </div>
      </Card>
      <Card title="Contact / hosts">
        <div className="a-grid">
          <Text label="Section title" value={contact.title} onChange={(v) => set('contact.title', v)} />
          <Text label="Hosts" value={contact.hosts} onChange={(v) => set('contact.hosts', v)} />
          <TextArea label="Address" rows={2} value={contact.address} onChange={(v) => set('contact.address', v)} />
          <TextArea label="Quote / personal note" rows={2} value={contact.quote} onChange={(v) => set('contact.quote', v)} />
          <Text label="Quote by" value={contact.quoteBy} onChange={(v) => set('contact.quoteBy', v)} />
        </div>
        <ListEditor
          items={contact.phones}
          onChange={(v) => set('contact.phones', v)}
          newItem={{ label: '', number: '' }}
          addLabel="Add phone number"
          itemTitle={(it, i) => it.label || `Phone ${i + 1}`}
          renderItem={(it, patch) => (
            <>
              <Text label="Label" placeholder="Bride's father" value={it.label} onChange={(v) => patch({ label: v })} />
              <Text label="Number" type="tel" value={it.number} onChange={(v) => patch({ number: v })} />
            </>
          )}
        />
      </Card>
      <Card title="Footer">
        <div className="a-grid">
          <Text label="Footer text" wide value={config.footer.text} onChange={(v) => set('footer.text', v)} />
        </div>
      </Card>
    </>
  );
}

export function MusicPanel({ config, set }) {
  const { music } = config;
  return (
    <Card title="Background music" hint="Plays softly once a guest opens the envelope. Browsers never allow sound before a tap.">
      <AudioField label="Music" hint="Upload an MP3 under 3 MB, or paste a direct link to an audio file." value={music.url} onChange={(v) => set('music.url', v)} />
      <div className="a-stack">
        <Toggle label="Start playing when the invitation is opened" checked={music.autoplay} onChange={(v) => set('music.autoplay', v)} />
      </div>
    </Card>
  );
}

export function BackupPanel({ config, replace, onReset, mode }) {
  const input = useRef(null);
  const importFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      replace(normalizeConfig(JSON.parse(await file.text())));
    } catch {
      window.alert('That file is not a valid invitation backup.');
    }
  };
  return (
    <>
      <Card title="Backup & restore" hint="Download everything as a file, or load a previous backup into the editor.">
        <div className="a-row">
          <button type="button" className="a-btn" onClick={() => downloadText('invitation-backup.json', JSON.stringify(config, null, 2))}>
            Download backup
          </button>
          <button type="button" className="a-btn" onClick={() => input.current.click()}>
            Import backup…
          </button>
          <input ref={input} type="file" accept="application/json,.json" hidden onChange={importFile} />
        </div>
        {mode === 'local' && (
          <p className="a-hint">
            You are in local mode. To publish without cloud storage, save the downloaded file as <code>public/config.json</code> and redeploy.
          </p>
        )}
      </Card>
      <Card title="Start over">
        <button type="button" className="a-btn a-btn--danger" onClick={onReset}>
          Reset editor to the sample invitation
        </button>
        <p className="a-hint">Only changes the editor. Nothing is published until you press Publish.</p>
      </Card>
    </>
  );
}
