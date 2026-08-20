import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import type { Event } from '../../types';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function Explore() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const { data } = await api.get('/events');
        setEvents(data.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  return (
    <div className="min-h-screen bg-muted font-sans p-4">
      <div className="max-w-3xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl text-saffron-600 font-bold">Explore Events</h1>
          <Link to="/" className="text-saffron-600 hover:underline text-sm">Back to Dashboard</Link>
        </div>

        {loading && <p className="text-text-muted">Loading events...</p>}

        {!loading && error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="bg-surface border border-border rounded-xl p-8 text-center">
            <p className="text-text-muted">No upcoming events right now. Check back soon!</p>
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {events.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="bg-surface border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow block"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold">{event.title}</h3>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-saffron-100 text-saffron-600 whitespace-nowrap">
                    {event.status}
                  </span>
                </div>
                <p className="text-sm text-text-muted mt-1">
                  {event.category.icon ? `${event.category.icon} ` : ''}
                  {event.category.name}
                </p>
                <div className="mt-3 text-sm text-text-muted space-y-1">
                  <p>📅 {formatDate(event.date)} at {event.startTime}</p>
                  <p>📍 {event.address}</p>
                  <p>🙋 Hosted by {event.host.name}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
