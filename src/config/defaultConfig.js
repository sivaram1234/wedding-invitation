import { THEME_PRESETS } from './themes.js';

// The complete invitation content. Everything here is editable from /admin.
// Image fields left empty render a decorative placeholder instead of a photo.

export const SECTION_LABELS = {
  countdown: 'Countdown',
  union: 'The Union',
  story: 'Our Journey',
  events: 'Celebrations',
  rituals: 'Wedding Rituals',
  gallery: 'Gallery',
  venue: 'Venue',
  rsvp: 'RSVP',
  contact: 'Contact',
};

export const EVENT_ICONS = {
  mehendi: '🌿',
  haldi: '🌼',
  sangeet: '🎶',
  wedding: '💍',
  reception: '🥂',
  pooja: '🪔',
  flower: '🌸',
  heart: '❤️',
};

const defaultConfig = {
  version: 2,

  meta: {
    title: 'Ananya & Arjun · Wedding Invitation',
    description: 'Join us as we begin our forever. 12 December 2026.',
  },

  theme: {
    preset: 'midnight',
    colors: { ...THEME_PRESETS.midnight.colors },
    fonts: { ...THEME_PRESETS.midnight.fonts },
    frame: 'arch', // 'arch' | 'scalloped' | 'pointed' | 'oval'
    portraitFrame: 'classic', // 'classic' | 'wreath'
    florals: false,
    emboss: false,
    sparkles: false,
    petals: true,
    paperTexture: true,
  },

  cover: {
    enabled: true,
    sealText: 'Tap to open',
    tagline: 'You are invited',
    showNames: true,
    showDate: true,
  },

  couple: {
    invitationOf: 'bride', // 'bride' | 'groom' — whose name comes first
    bride: {
      name: 'Ananya Sharma',
      shortName: 'Ananya',
      photo: '',
      relation: 'Daughter of',
      parents: 'Smt. Lakshmi & Sri Ramesh Sharma',
    },
    groom: {
      name: 'Arjun Reddy',
      shortName: 'Arjun',
      photo: '',
      relation: 'Son of',
      parents: 'Smt. Padma & Sri Venkat Reddy',
    },
    hashtag: '#AnanyaWedsArjun',
  },

  hero: {
    eyebrow: "Bride's Invitation",
    invitationLine: 'request the honour of your presence at their wedding',
    image: '',
    backgroundImage: '',
    location: 'Hyderabad, Telangana',
    muhurtham: 'Shubha Muhurtham · Vrischika Lagnam',
  },

  wedding: {
    date: '2026-12-12',
    time: '11:15',
    utcOffset: '+05:30',
  },

  countdown: {
    title: 'Counting down to forever',
    doneText: 'We are married! Thank you for your blessings.',
  },

  union: {
    title: 'The Union',
    text:
      'With the blessings of our elders and the love of our families, we are delighted to invite you to share in the joy of our wedding. Your presence will make our celebration complete.',
    image: '',
  },

  story: {
    title: 'Our Journey',
    items: [
      { date: '14 Feb 2025', title: 'First Meet', text: 'A cup of chai, a long conversation, and the beginning of everything.', image: '' },
      { date: '20 Aug 2026', title: 'Engagement', text: 'Rings exchanged, families united, and a promise made.', image: '' },
      { date: '12 Dec 2026', title: 'Forever', text: 'The day we say yes to a lifetime together.', image: '' },
    ],
  },

  events: {
    title: 'The Celebrations',
    subtitle: 'Scratch each card to reveal the details',
    scratch: true,
    items: [
      { icon: 'mehendi', name: 'Mehendi', date: '2026-12-10', time: '16:00', venue: 'Family Residence', dressCode: 'Shades of green', note: '' },
      { icon: 'haldi', name: 'Haldi', date: '2026-12-11', time: '10:00', venue: 'Family Residence', dressCode: 'Yellow', note: '' },
      { icon: 'wedding', name: 'Wedding Ceremony', date: '2026-12-12', time: '11:15', venue: 'Sri Lakshmi Convention Hall', dressCode: 'Traditional', note: 'Lunch to follow' },
    ],
  },

  rituals: {
    title: 'Wedding Rituals',
    intro: 'The sacred traditions that will bind us together.',
    items: [
      { title: 'Ganapathi Pooja', subtitle: 'Seeking blessings for a smooth beginning' },
      { title: 'Kanyadanam', subtitle: 'The giving away of the bride' },
      { title: 'Jeelakarra Bellam', subtitle: 'The auspicious moment of union' },
      { title: 'Mangalya Dharana', subtitle: 'Tying of the sacred mangalsutra' },
      { title: 'Talambralu', subtitle: 'Showering of turmeric rice' },
      { title: 'Saptapadi', subtitle: 'Seven steps, seven vows' },
    ],
  },

  gallery: {
    title: 'Moments',
    images: [],
  },

  venue: {
    title: 'The Venue',
    name: 'Sri Lakshmi Convention Hall',
    address: 'Road No. 12, Banjara Hills, Hyderabad, Telangana 500034',
    mapQuery: 'Banjara Hills, Hyderabad',
    mapLink: '',
    image: '',
    note: 'Parking available on the premises.',
  },

  rsvp: {
    title: 'Kindly Respond',
    text: 'We would love to know if you can join us. Send your reply straight to us on WhatsApp.',
    deadline: 'Kindly respond by 1 December 2026',
    whatsapp: '919999999999',
    buttonText: 'Send RSVP on WhatsApp',
  },

  contact: {
    title: 'With Love From',
    hosts: 'Smt. Lakshmi & Sri Ramesh Sharma',
    address: 'Jubilee Hills, Hyderabad, Telangana',
    phones: [{ label: 'Family', number: '+91 99999 99999' }],
    quote: 'Please come and bless our sister on her special day.',
    quoteBy: 'Priya Sharma',
  },

  music: {
    url: '',
    autoplay: true,
  },

  footer: {
    text: 'Made with love for our family and friends',
  },

  sections: [
    { id: 'countdown', visible: true },
    { id: 'union', visible: true },
    { id: 'story', visible: true },
    { id: 'events', visible: true },
    { id: 'rituals', visible: true },
    { id: 'gallery', visible: true },
    { id: 'venue', visible: true },
    { id: 'rsvp', visible: true },
    { id: 'contact', visible: true },
  ],
};

export default defaultConfig;
