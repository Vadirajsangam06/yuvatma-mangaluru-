interface IcsEventInput {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string; // "HH:MM"
  endTime?: string | null; // "HH:MM"
  address: string;
  mapsUrl?: string | null;
  hostName: string;
  status: 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
  eventUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DEFAULT_DURATION_HOURS = 2;

// RFC5545 requires escaping commas, semicolons, backslashes and newlines in text fields.
function escapeIcsText(text: string) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

// Floating local time (no Z/TZID) — the widest-compatible fallback since
// the app doesn't currently store an event timezone.
function formatIcsDateTime(date: Date, time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(hours).padStart(2, '0');
  const min = String(minutes).padStart(2, '0');
  return `${yyyy}${mm}${dd}T${hh}${min}00`;
}

function formatIcsTimestampUtc(date: Date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export function buildEventIcs(event: IcsEventInput): string {
  const dtStart = formatIcsDateTime(event.date, event.startTime);

  let dtEnd: string;
  if (event.endTime) {
    dtEnd = formatIcsDateTime(event.date, event.endTime);
  } else {
    const [h, m] = event.startTime.split(':').map(Number);
    const start = new Date(event.date);
    start.setHours(h, m, 0, 0);
    const end = addHours(start, DEFAULT_DURATION_HOURS);
    dtEnd = formatIcsDateTime(end, `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`);
  }

  const descriptionParts = [
    event.description,
    `Hosted by ${event.hostName}`,
    event.mapsUrl ? `Directions: ${event.mapsUrl}` : '',
    event.eventUrl ? `Event page: ${event.eventUrl}` : '',
  ].filter(Boolean);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Yuvatma Mangaluru//Event Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@yuvatma.in`,
    `DTSTAMP:${formatIcsTimestampUtc(new Date())}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(descriptionParts.join('\n\n'))}`,
    `LOCATION:${escapeIcsText(event.address)}`,
    `STATUS:${event.status === 'CANCELLED' ? 'CANCELLED' : 'CONFIRMED'}`,
    `LAST-MODIFIED:${formatIcsTimestampUtc(event.updatedAt)}`,
    `CREATED:${formatIcsTimestampUtc(event.createdAt)}`,
    ...(event.mapsUrl ? [`URL:${event.mapsUrl}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  // RFC5545 requires CRLF line endings.
  return lines.join('\r\n');
}
