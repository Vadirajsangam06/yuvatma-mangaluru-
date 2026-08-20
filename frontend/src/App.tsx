import { useEffect, useState } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { api } from './api/client';
import type { Event } from './types';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import CreateEvent from './pages/protected/CreateEvent';
import Explore from './pages/protected/Explore';
import EventDetails from './pages/protected/EventDetails';
import InviteMembers from './pages/protected/InviteMembers';
import EventInvitees from './pages/protected/EventInvitees';
import EditEvent from './pages/protected/EditEvent';
import Profile from './pages/protected/Profile';
import NotificationBell from './components/NotificationBell';
import Invitations from './pages/protected/Invitations';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function Dashboard({ userName }: { userName: string }) {
  const { logout } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState('');
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState('');

  useEffect(() => {
    const loadMyEvents = async () => {
      try {
        const { data } = await api.get('/events/mine');
        setEvents(data.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load your events');
      } finally {
        setLoading(false);
      }
    };
    loadMyEvents();
  }, []);

  const handleCancel = async (eventId: string) => {
    if (!window.confirm('Cancel this event? Invited members will be notified. This cannot be undone.')) {
      return;
    }
    setCancelError('');
    setCancellingId(eventId);
    try {
      const { data } = await api.post(`/events/${eventId}/cancel`);
      setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, status: data.data.status } : e)));
    } catch (err: any) {
      setCancelError(err.message || 'Failed to cancel event');
    } finally {
      setCancellingId(null);
    }
  };

  const handleRestore = async (eventId: string) => {
    if (!window.confirm('Restore this event to active? Invited members will be notified.')) {
      return;
    }
    setRestoreError('');
    setRestoringId(eventId);
    try {
      const { data } = await api.post(`/events/${eventId}/restore`);
      setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, status: data.data.status } : e)));
    } catch (err: any) {
      setRestoreError(err.message || 'Failed to restore event');
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="min-h-screen bg-muted font-sans p-4">
      <div className="max-w-3xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl text-saffron-600 font-bold">🪔 Yuvatma Mangaluru</h1>
            <p className="text-text-muted">Welcome back, {userName}!</p>
          </div>
          <div className="flex gap-3 items-center">
            <NotificationBell />
            <Link to="/profile" className="bg-white border border-border text-saffron-600 px-5 py-2 rounded-lg font-medium hover:bg-saffron-50 transition-colors">Profile</Link>
            <Link to="/explore" className="bg-white border border-border text-saffron-600 px-5 py-2 rounded-lg font-medium hover:bg-saffron-50 transition-colors">Explore Events</Link>
            <Link to="/invitations" className="bg-white border border-border text-saffron-600 px-5 py-2 rounded-lg font-medium hover:bg-saffron-50 transition-colors">Invitations</Link>
            <Link to="/events/create" className="bg-saffron-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-saffron-600 transition-colors">Create Event</Link>
            <button onClick={logout} className="bg-border px-5 py-2 rounded-lg hover:bg-gray-200 transition-colors">Logout</button>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Your Events</h2>

        {loading && <p className="text-text-muted">Loading your events...</p>}

        {!loading && error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
        )}

        {cancelError && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4">{cancelError}</div>
        )}

        {restoreError && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4">{restoreError}</div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="bg-surface border border-border rounded-xl p-8 text-center">
            <p className="text-text-muted mb-4">You haven't created any events yet.</p>
            <Link to="/events/create" className="bg-saffron-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-saffron-600 transition-colors inline-block">Create Your First Event</Link>
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="bg-surface border border-border rounded-xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                    <p className="text-sm text-text-muted mt-1">
                      {event.category.icon ? `${event.category.icon} ` : ''}
                      {event.category.name}
                    </p>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-saffron-100 text-saffron-600 whitespace-nowrap">
                    {event.status}
                  </span>
                </div>
                <div className="mt-3 text-sm text-text-muted space-y-1">
                  <p>📅 {formatDate(event.date)} at {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}</p>
                  <p>📍 {event.address}</p>
                </div>
                <Link
                  to={`/events/${event.id}/invite`}
                  className="mt-3 inline-block text-sm text-saffron-600 hover:underline"
                >
                  Invite Members →
                </Link>
                <Link
                  to={`/events/${event.id}/invitees`}
                  className="mt-3 ml-4 inline-block text-sm text-saffron-600 hover:underline"
                >
                  View Invited Members →
                </Link>
                {event.status === 'ACTIVE' && (
                  <>
                    <Link
                      to={`/events/${event.id}/edit`}
                      className="mt-3 ml-4 inline-block text-sm text-saffron-600 hover:underline"
                    >
                      Edit Event →
                    </Link>
                    <button
                      onClick={() => handleCancel(event.id)}
                      disabled={cancellingId === event.id}
                      className="mt-3 ml-4 inline-block text-sm text-red-600 hover:underline disabled:opacity-60"
                    >
                      {cancellingId === event.id ? 'Cancelling...' : 'Cancel Event'}
                    </button>
                  </>
                )}
                {event.status === 'CANCELLED' && (
                  <button
                    onClick={() => handleRestore(event.id)}
                    disabled={restoringId === event.id}
                    className="mt-3 inline-block text-sm text-saffron-600 hover:underline disabled:opacity-60"
                  >
                    {restoringId === event.id ? 'Restoring...' : 'Restore Event →'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Home() {
  const { user } = useAuth();

  if (user) return <Dashboard userName={user.name} />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-muted font-sans">
      <h1 className="text-4xl text-saffron-600 mb-2 font-bold">🪔 Yuvatma Mangaluru</h1>
      <div className="flex gap-4">
        <Link to="/login" className="bg-saffron-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-saffron-600 transition-colors">Login</Link>
        <Link to="/register" className="bg-white border border-border text-saffron-600 px-6 py-2 rounded-lg font-medium hover:bg-saffron-50 transition-colors">Register</Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/events/create"
        element={
          <ProtectedRoute>
            <CreateEvent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/explore"
        element={
          <ProtectedRoute>
            <Explore />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/:id"
        element={
          <ProtectedRoute>
            <EventDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/:id/invite"
        element={
          <ProtectedRoute>
            <InviteMembers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/:id/invitees"
        element={
          <ProtectedRoute>
            <EventInvitees />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/:id/edit"
        element={
          <ProtectedRoute>
            <EditEvent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invitations"
        element={
          <ProtectedRoute>
            <Invitations />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
