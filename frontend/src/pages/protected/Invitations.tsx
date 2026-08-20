import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import type { Invitation } from '../../types';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function Invitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [respondingId, setRespondingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/invitations/mine');
        setInvitations(data.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load invitations');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const respond = async (invitationId: string, status: 'ACCEPTED' | 'DECLINED') => {
    setRespondingId(invitationId);
    try {
      const { data } = await api.patch(`/invitations/${invitationId}`, { status });
      setInvitations((prev) =>
        prev.map((inv) => (inv.id === invitationId ? { ...inv, status: data.data.status } : inv)),
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update invitation');
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-muted font-sans p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl text-saffron-600 font-bold">Your Invitations</h1>
          <Link to="/" className="text-saffron-600 hover:underline text-sm">Back to Dashboard</Link>
        </div>

        {loading && <p className="text-text-muted">Loading invitations...</p>}
        {!loading && error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

        {!loading && !error && invitations.length === 0 && (
          <div className="bg-surface border border-border rounded-xl p-8 text-center">
            <p className="text-text-muted">You have no invitations yet.</p>
          </div>
        )}

        {!loading && !error && invitations.length > 0 && (
          <div className="space-y-4">
            {invitations.map((inv) => (
              <div key={inv.id} className="bg-surface border border-border rounded-xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-semibold">{inv.event.title}</h3>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
                      inv.status === 'ACCEPTED'
                        ? 'bg-green-100 text-green-700'
                        : inv.status === 'DECLINED'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-saffron-100 text-saffron-600'
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>
                <div className="mt-2 text-sm text-text-muted space-y-1">
                  <p>📅 {formatDate(inv.event.date)} at {inv.event.startTime}</p>
                  <p>📍 {inv.event.address}</p>
                  <p>🙋 Hosted by {inv.event.host.name}</p>
                </div>

                {inv.status === 'PENDING' && (
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => respond(inv.id, 'ACCEPTED')}
                      disabled={respondingId === inv.id}
                      className="bg-saffron-500 hover:bg-saffron-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-70"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => respond(inv.id, 'DECLINED')}
                      disabled={respondingId === inv.id}
                      className="bg-border text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-70"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
