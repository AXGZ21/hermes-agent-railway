import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Session } from '../../types';
import { MessageSquare, Trash2, Download, Search } from 'lucide-react';

export const SessionHistory = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await api.getSessions();
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this session?')) {
      try {
        await api.deleteSession(id);
        setSessions(sessions.filter((s) => s.id !== id));
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
    }
  };

  const handleExport = async (session: Session, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const data = await api.getSession(session.id);
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `session-${session.id}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export session:', error);
    }
  };

  const handleOpen = (id: string) => {
    navigate(`/chat/${id}`);
  };

  const filteredSessions = sessions.filter((session) =>
    searchQuery
      ? session.title.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="h-full flex flex-col bg-slate-950">
      <div className="bg-slate-900 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-slate-100">Session History</h1>

          <div className="relative flex-1 max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sessions..."
              className="w-full bg-slate-800 text-slate-100 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="text-center text-slate-400 py-8">Loading sessions...</div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            {searchQuery ? 'No sessions found matching your search' : 'No sessions yet'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleOpen(session.id)}
                className="bg-slate-900 rounded-lg p-5 border border-slate-800 hover:border-violet-500 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <MessageSquare size={20} className="text-violet-400 flex-shrink-0" />
                      <h3 className="text-lg font-semibold text-slate-100 truncate">
                        {session.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span>{session.message_count} messages</span>
                      <span>•</span>
                      <span>Created {new Date(session.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Updated {new Date(session.updated_at).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleExport(session, e)}
                      className="p-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition-colors"
                      title="Export session"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(session.id, e)}
                      className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      title="Delete session"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
