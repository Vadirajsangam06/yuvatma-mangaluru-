import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import type { Event } from '../../types';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [attending, setAttending] = useState(false);
  const [attendLoading, setAttendLoading] = useState(false);
  const [attendError, setAttendError] = useState('');
  const [attendSuccess, setAttendSuccess] = useState(false);

  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState('');
  const [calendarSuccess, setCalendarSuccess] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        setEvent(data.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };
    loadEvent();
  }, [id]);

  const handleAttend = async () => {
    setAttendError('');
    setAttendLoading(true);
    try {
      await api.post(`/events/${id}/attend`);
      setAttending(true);
      setAttendSuccess(true);
      setEvent((prev) => (prev ? { ...prev, rsvpCount: prev.rsvpCount + 1 } : prev));
    } catch (err: any) {
      setAttendError(err.message || 'Failed to attend event');
    } finally {
      setAttendLoading(false);
    }
  };

  const handleAddToCalendar = async () => {
    setCalendarError('');
    setCalendarSuccess(false);
    setCalendarLoading(true);
    try {
      const response = await api.get(`/events/${id}/calendar.ics`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/calendar' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${event?.slug || 'event'}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setCalendarSuccess(true);
    } catch (err: any) {
      setCalendarError(err.message || 'Failed to generate calendar file');
    } finally {
      setCalendarLoading(false);
    }
  };

  const isHost = user && event && event.hostId === user.id;

  return (
    <div className="min-h-screen bg-muted font-sans p-4">
      <div className="max-w-2xl mx-auto py-8">
        <Link to="/explore" className="text-saffron-600 hover:underline text-sm mb-4 inline-block">← Back to Explore</Link>

        {loading && <p className="text-text-muted">Loading event...</p>}

        {!loading && error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
        )}

        {!loading && !error && event && (
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold">{event.title}</h1>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-saffron-100 text-saffron-600 whitespace-nowrap">
                {event.status}
              </span>
            </div>

            <p className="text-sm text-text-muted mt-1">
              {event.category.icon ? `${event.category.icon} ` : ''}
              {event.category.name}
            </p>

            {event.description && (
              <p className="mt-4 text-text">{event.description}</p>
            )}

            <div className="mt-5 space-y-2 text-sm text-text-muted">
              <p>📅 {formatDate(event.date)} at {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}</p>
              <p>📍 {event.address}</p>
              <p>🙋 Hosted by {event.host.name}</p>
              <p>👥 {event.rsvpCount} attending{event.maxAttendees ? ` / ${event.maxAttendees} max` : ''}</p>
            </div>

            {event.mapsUrl && (
              <a
                href={event.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-saffron-600 hover:underline"
              >
                📍 Open in Google Maps →
              </a>
            )}

            <div className="mt-3">
              <button
                onClick={handleAddToCalendar}
                disabled={calendarLoading}
                className="inline-flex items-center gap-1.5 text-sm font-medium bg-white border border-border text-saffron-600 px-4 py-2 rounded-lg hover:bg-saffron-50 transition-colors disabled:opacity-70"
              >
                {calendarLoading ? 'Preparing...' : '📅 Add to Calendar'}
              </button>
              {calendarError && (
                <p className="mt-2 text-sm text-red-600">{calendarError}</p>
              )}
              {calendarSuccess && (
                <p className="mt-2 text-sm text-green-700">Calendar file downloaded — open it to add this event to your calendar app.</p>
              )}
            </div>

            {attendError && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{attendError}</div>
            )}
            {attendSuccess && (
              <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                You're now attending this event!
              </div>
            )}

            <div className="mt-6">
              {isHost ? (
                <p className="text-sm text-text-muted">You are the host of this event.</p>
              ) : attending ? (
                <button disabled className="bg-border text-text-muted px-6 py-2.5 rounded-lg font-medium cursor-not-allowed">
                  Attending
                </button>
              ) : (
                <button
                  onClick={handleAttend}
                  disabled={attendLoading || event.status !== 'ACTIVE'}
                  className="bg-saffron-500 hover:bg-saffron-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-70"
                >
                  {attendLoading ? 'Attending...' : 'Attend Event'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
