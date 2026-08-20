import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import type { EventCategory, Event } from '../../types';

export default function EditEvent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [forbidden, setForbidden] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [address, setAddress] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [eventRes, catRes] = await Promise.all([
          api.get(`/events/${id}`),
          api.get('/categories'),
        ]);
        const event: Event = eventRes.data.data;
        setCategories(catRes.data.data);

        if (!user || event.hostId !== user.id) {
          setForbidden(true);
          return;
        }

        setTitle(event.title);
        setDescription(event.description);
        setCategoryId(event.category.id);
        setDate(event.date.slice(0, 10));
        setStartTime(event.startTime);
        setEndTime(event.endTime || '');
        setAddress(event.address);
        setMapsUrl(event.mapsUrl || '');
        setLatitude(String(event.latitude));
        setLongitude(String(event.longitude));
        setContactNumber(event.contactNumber || '');
        setMaxAttendees(event.maxAttendees ? String(event.maxAttendees) : '');
        setVisibility(event.visibility);
      } catch (err: any) {
        setLoadError(err.message || 'Failed to load event');
      } finally {
        setLoadingInitial(false);
      }
    };
    load();
  }, [id, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.patch(`/events/${id}`, {
        title,
        description,
        categoryId,
        date,
        startTime,
        endTime: endTime || undefined,
        address,
        mapsUrl: mapsUrl || undefined,
        latitude: Number(latitude),
        longitude: Number(longitude),
        contactNumber: contactNumber || undefined,
        maxAttendees: maxAttendees ? Number(maxAttendees) : undefined,
        visibility,
      });
      setSuccess(true);
      setTimeout(() => navigate('/'), 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <p className="text-text-muted">Loading event...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <div className="max-w-lg w-full bg-surface p-8 rounded-xl shadow-md border border-border">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{loadError}</div>
          <Link to="/" className="text-saffron-600 hover:underline text-sm mt-4 inline-block">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <div className="max-w-lg w-full bg-surface p-8 rounded-xl shadow-md border border-border">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">You are not the host of this event.</div>
          <Link to="/" className="text-saffron-600 hover:underline text-sm mt-4 inline-block">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="max-w-lg w-full bg-surface p-8 rounded-xl shadow-md border border-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-saffron-600 mb-2">Edit Event</h1>
          <p className="text-text-muted">Update your event details</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
            Event updated! Invited members have been notified. Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              required
              className="w-full p-2.5 rounded-lg border border-border focus:ring-2 focus:ring-saffron-400 outline-none transition-all"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              required
              rows={3}
              className="w-full p-2.5 rounded-lg border border-border focus:ring-2 focus:ring-saffron-400 outline-none transition-all"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              required
              className="w-full p-2.5 rounded-lg border border-border focus:ring-2 focus:ring-saffron-400 outline-none transition-all"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon ? `${cat.icon} ` : ''}
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                required
                className="w-full p-2.5 rounded-lg border border-border focus:ring-2 focus:ring-saffron-400 outline-none transition-all"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <input
                type="time"
                required
                className="w-full p-2.5 rounded-lg border border-border focus:ring-2 focus:ring-saffron-400 outline-none transition-all"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Time (Optional)</label>
            <input
              type="time"
              className="w-full p-2.5 rounded-lg border border-border focus:ring-2 focus:ring-saffron-400 outline-none transition-all"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              type="text"
              required
              className="w-full p-2.5 rounded-lg border border-border focus:ring-2 focus:ring-saffron-400 outline-none transition-all"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Google Maps Link (Optional)</label>
            <input
              type="url"
              placeholder="https://maps.google.com/?q=..."
              className="w-full p-2.5 rounded-lg border border-border focus:ring-2 focus:ring-saffron-400 outline-none transition-all"
              value={mapsUrl}
              onChange={(e) => setMapsUrl(e.target.value)}
            />
            <p className="text-xs text-text-muted mt-1">Paste a Google Maps share link so invitees can open directions directly.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                required
                className="w-full p-2.5 rounded-lg border border-border focus:ring-2 focus:ring-saffron-400 outline-none transition-all"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                required
                className="w-full p-2.5 rounded-lg border border-border focus:ring-2 focus:ring-saffron-400 outline-none transition-all"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Contact Number (Optional)</label>
              <input
                type="tel"
                className="w-full p-2.5 rounded-lg border border-border focus:ring-2 focus:ring-saffron-400 outline-none transition-all"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Attendees (Optional)</label>
              <input
                type="number"
                min={1}
                className="w-full p-2.5 rounded-lg border border-border focus:ring-2 focus:ring-saffron-400 outline-none transition-all"
                value={maxAttendees}
                onChange={(e) => setMaxAttendees(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Visibility</label>
            <select
              className="w-full p-2.5 rounded-lg border border-border focus:ring-2 focus:ring-saffron-400 outline-none transition-all"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as 'PUBLIC' | 'PRIVATE')}
            >
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-saffron-500 hover:bg-saffron-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-70"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          <Link to="/" className="text-saffron-600 hover:underline">Back to Dashboard</Link>
        </p>
      </div>
    </div>
  );
}
