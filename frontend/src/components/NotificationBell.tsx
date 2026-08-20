import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { Notification } from '../types';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = async (n: Notification) => {
    if (!n.isRead) {
      try {
        await api.patch(`/notifications/${n.id}/read`);
        setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      } catch {
        // non-blocking
      }
    }
    setOpen(false);
    if (n.type === 'EVENT_INVITATION') {
      navigate('/invitations');
    } else if (n.type === 'INVITATION_ACCEPTED' || n.type === 'INVITATION_DECLINED') {
      navigate(n.eventId ? `/events/${n.eventId}/invitees` : '/');
    } else if (n.eventId) {
      navigate(`/events/${n.eventId}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err: any) {
      setError(err.message || 'Failed to mark all as read');
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative bg-white border border-border w-10 h-10 rounded-lg flex items-center justify-center hover:bg-saffron-50 transition-colors"
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-surface border border-border rounded-xl shadow-lg z-10">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <p className="font-semibold text-sm">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-saffron-600 hover:underline">
                Mark all read
              </button>
            )}
          </div>

          {loading && <p className="p-4 text-sm text-text-muted">Loading...</p>}
          {!loading && error && <p className="p-4 text-sm text-red-600">{error}</p>}
          {!loading && !error && notifications.length === 0 && (
            <p className="p-4 text-sm text-text-muted">No notifications yet.</p>
          )}

          {!loading && !error && notifications.length > 0 && (
            <div className="divide-y divide-border">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full text-left p-3 hover:bg-saffron-50 transition-colors ${
                    !n.isRead ? 'bg-saffron-50/60' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && <span className="w-2 h-2 mt-1.5 rounded-full bg-saffron-500 shrink-0" />}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-text-muted mt-0.5">{n.message}</p>
                      <p className="text-xs text-text-muted mt-1">{formatDate(n.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
