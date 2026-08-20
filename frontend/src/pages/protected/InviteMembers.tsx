import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client';
import type { DirectoryUser } from '../../types';

export default function InviteMembers() {
  const { id } = useParams<{ id: string }>();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DirectoryUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const [selected, setSelected] = useState<Map<string, DirectoryUser>>(new Map());

  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sendSuccess, setSendSuccess] = useState('');

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    setSearching(true);
    setSearchError('');
    const handle = setTimeout(async () => {
      try {
        const { data } = await api.get('/users/search', { params: { q } });
        setResults(data.data);
      } catch (err: any) {
        setSearchError(err.message || 'Search failed');
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  const toggleSelect = (user: DirectoryUser) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(user.id)) next.delete(user.id);
      else next.set(user.id, user);
      return next;
    });
  };

  const handleSend = async () => {
    setSendError('');
    setSendSuccess('');
    setSending(true);
    try {
      const { data } = await api.post(`/events/${id}/invite`, {
        userIds: Array.from(selected.keys()),
      });
      setSendSuccess(`Invited ${data.data.invited} member${data.data.invited === 1 ? '' : 's'} successfully.`);
      setSelected(new Map());
    } catch (err: any) {
      setSendError(err.message || 'Failed to send invitations');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted font-sans p-4">
      <div className="max-w-xl mx-auto py-8">
        <Link to="/" className="text-saffron-600 hover:underline text-sm mb-4 inline-block">← Back to Dashboard</Link>

        <h1 className="text-2xl font-bold mb-1">Invite Members</h1>
        <p className="text-text-muted text-sm mb-6">Search registered members and select who to invite.</p>

        <input
          type="text"
          placeholder="Search by name..."
          className="w-full p-2.5 rounded-lg border border-border focus:ring-2 focus:ring-saffron-400 outline-none transition-all mb-2"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <p className="text-sm text-text-muted mb-3">{selected.size} member{selected.size === 1 ? '' : 's'} selected</p>

        {searching && <p className="text-text-muted text-sm">Searching...</p>}
        {searchError && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-3">{searchError}</div>}

        {!searching && query.trim() && results.length === 0 && (
          <p className="text-text-muted text-sm mb-3">No members found.</p>
        )}

        <div className="space-y-2 mb-6">
          {results.map((u) => (
            <label
              key={u.id}
              className="flex items-center gap-3 bg-surface border border-border rounded-lg p-3 cursor-pointer hover:bg-saffron-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={selected.has(u.id)}
                onChange={() => toggleSelect(u)}
                className="w-4 h-4 accent-saffron-500"
              />
              <span>{u.name}</span>
            </label>
          ))}
        </div>

        {selected.size > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Selected:</p>
            <div className="flex flex-wrap gap-2">
              {Array.from(selected.values()).map((u) => (
                <span key={u.id} className="text-xs bg-saffron-100 text-saffron-600 px-2.5 py-1 rounded-full">
                  {u.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {sendError && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4">{sendError}</div>}
        {sendSuccess && <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm mb-4">{sendSuccess}</div>}

        <button
          onClick={handleSend}
          disabled={selected.size === 0 || sending}
          className="w-full bg-saffron-500 hover:bg-saffron-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-70"
        >
          {sending ? 'Sending...' : `Send Invitations${selected.size ? ` (${selected.size})` : ''}`}
        </button>
      </div>
    </div>
  );
}
