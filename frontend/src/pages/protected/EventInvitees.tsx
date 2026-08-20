import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client';

interface InviteeRow {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
  user: { id: string; name: string; profileImage?: string };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const statusStyle: Record<string, string> = {
  ACCEPTED: 'bg-green-100 text-green-700',
  DECLINED: 'bg-red-100 text-red-600',
  PENDING: 'bg-saffron-100 text-saffron-600',
};

export default function EventInvitees() {
  const { id } = useParams<{ id: string }>();

  const [invitees, setInvitees] = useState<InviteeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/events/${id}/invitations`);
        setInvitees(data.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load invited members');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const total = invitees.length;
  const accepted = invitees.filter((i) => i.status === 'ACCEPTED').length;
  const pending = invitees.filter((i) => i.status === 'PENDING').length;
  const declined = invitees.filter((i) => i.status === 'DECLINED').length;

  return (
    <div className="min-h-screen bg-muted font-sans p-4">
      <div className="max-w-xl mx-auto py-8">
        <Link to="/" className="text-saffron-600 hover:underline text-sm mb-4 inline-block">← Back to Dashboard</Link>

        <h1 className="text-2xl font-bold mb-6">Invited Members</h1>

        {loading && <p className="text-text-muted">Loading invited members...</p>}
        {!loading && error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="bg-surface border border-border rounded-lg p-3 text-center">
                <p className="text-xl font-bold">{total}</p>
                <p className="text-xs text-text-muted">Total</p>
              </div>
              <div className="bg-surface border border-border rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-green-700">{accepted}</p>
                <p className="text-xs text-text-muted">Accepted</p>
              </div>
              <div className="bg-surface border border-border rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-saffron-600">{pending}</p>
                <p className="text-xs text-text-muted">Pending</p>
              </div>
              <div className="bg-surface border border-border rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-red-600">{declined}</p>
                <p className="text-xs text-text-muted">Declined</p>
              </div>
            </div>

            {total === 0 ? (
              <div className="bg-surface border border-border rounded-xl p-8 text-center">
                <p className="text-text-muted">No members invited yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {invitees.map((inv) => (
                  <div key={inv.id} className="flex items-center gap-3 bg-surface border border-border rounded-lg p-3">
                    {inv.user.profileImage ? (
                      <img src={inv.user.profileImage} alt={inv.user.name} className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-saffron-100 text-saffron-600 flex items-center justify-center font-medium">
                        {inv.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{inv.user.name}</p>
                      <p className="text-xs text-text-muted">Invited {formatDate(inv.createdAt)}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${statusStyle[inv.status]}`}>
                      {inv.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
