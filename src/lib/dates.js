// Dates are stored as plain "YYYY-MM-DD" / "HH:mm" strings in the venue's local time,
// so they display identically for every guest regardless of their timezone.

function parts(date) {
  const [y, m, d] = (date || '').split('-').map(Number);
  return y && m && d ? { y, m, d } : null;
}

function fmt(date, options) {
  const p = parts(date);
  if (!p) return date || '';
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', ...options }).format(new Date(Date.UTC(p.y, p.m - 1, p.d)));
}

export const formatLongDate = (date) => fmt(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
export const formatShortDate = (date) => fmt(date, { day: '2-digit', month: 'short', year: 'numeric' });
export const formatDayMonth = (date) => fmt(date, { day: '2-digit', month: 'short' });
export const formatWeekday = (date) => fmt(date, { weekday: 'long' });

export function formatDots(date) {
  const p = parts(date);
  return p ? `${String(p.d).padStart(2, '0')} · ${String(p.m).padStart(2, '0')} · ${p.y}` : '';
}

export function formatTime(time) {
  const [h, m] = (time || '').split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return time || '';
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${suffix}`;
}

// Absolute instant of a local date/time at the given UTC offset (e.g. "+05:30").
export function toInstant(date, time = '00:00', utcOffset = '+05:30') {
  const offset = /^[+-]\d{2}:\d{2}$/.test(utcOffset) ? utcOffset : '+00:00';
  const t = new Date(`${date}T${time || '00:00'}:00${offset}`);
  return Number.isNaN(t.getTime()) ? null : t;
}

const pad = (n) => String(n).padStart(2, '0');
const utcStamp = (d) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

export function googleCalendarUrl({ title, date, time, utcOffset, hours = 3, location, details }) {
  const start = toInstant(date, time, utcOffset);
  if (!start) return null;
  const end = new Date(start.getTime() + hours * 3600_000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${utcStamp(start)}/${utcStamp(end)}`,
    location: location || '',
    details: details || '',
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

const icsEscape = (s = '') => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, (c) => `\\${c}`);

export function buildIcs({ title, date, time, utcOffset, hours = 3, location, details }) {
  const start = toInstant(date, time, utcOffset);
  if (!start) return null;
  const end = new Date(start.getTime() + hours * 3600_000);
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding Invitation//EN',
    'BEGIN:VEVENT',
    `UID:${utcStamp(start)}-${Math.random().toString(36).slice(2)}@invitation`,
    `DTSTAMP:${utcStamp(new Date())}`,
    `DTSTART:${utcStamp(start)}`,
    `DTEND:${utcStamp(end)}`,
    `SUMMARY:${icsEscape(title)}`,
    `LOCATION:${icsEscape(location)}`,
    `DESCRIPTION:${icsEscape(details)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
