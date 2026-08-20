import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import type { EventCategory } from '../../types';

export default function CreateEvent() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [address, setAddress] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');
  const [latitude, setLatitude] = useState('12.9141');
  const [longitude, setLongitude] = useState('74.8560');
  const [contactNumber, setContactNumber] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data.data);
        if (data.data.length > 0) setCategoryId(data.data[0].id);
      } catch (err: any) {
        setCategoriesError(err.message || 'Failed to load categories');
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/events', {
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
      setTimeout(() => navigate(`/`, { state: { createdEventSlug: data.data.slug } }), 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="max-w-lg w-full bg-surface p-8 rounded-xl shadow-md border border-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-saffron-600 mb-2">Create Event</h1>
          <p className="text-text-muted">Host a new event on Yuvatma Mangaluru</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
            Event created successfully! Redirecting...
          </div>
        )}
        {categoriesError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{categoriesError}</div>
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
              disabled={categoriesLoading}
              className="w-full p-2.5 rounded-lg border border-border focus:ring-2 focus:ring-saffron-400 outline-none transition-all"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categoriesLoading && <option>Loading categories...</option>}
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
            disabled={loading || categoriesLoading}
            className="w-full bg-saffron-500 hover:bg-saffron-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-70"
          >
            {loading ? 'Creating Event...' : 'Create Event'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          <Link to="/" className="text-saffron-600 hover:underline">Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
