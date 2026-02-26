import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Session } from '../../types';
import { useConfirmStore } from '../ConfirmDialog';
import { useToastStore } from '../../store/toast';
import { MessageSquare, Trash2, Download, Search, ChevronRight, Loader2 } from 'lucide-react';

export const SessionHistory = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const confirm = useConfirmStore((s) => s.open);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => { loadSessions(); }, []);

  const loadSessions = async () => {
    try {
      const data = await api.getSessions();
      setSessions(data);
    } catch {
      addToast('error', 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    confirm({
      title: 'Delete Session',
      message: 'This session and all its messages will be permanently deleted.',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        try {
          await api.deleteSession(id);
          setSessions((prev) => prev.filter((s) => s.id !== id));
          addToast('success', 'Session deleted');
        } catch {
          addToast('error', 'Failed to delete session');
        }
      },
    });
  };

  const handleExport = async (session: Session, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const data = await api.getSession(session.id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `session-${session.id}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast('success', 'Session exported');
    } catch {
      addToast('error', 'Failed to export session');
    }
  };

  const filteredSessions = sessions.filter((session) =>
    searchQuery ? session.title.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  return (
    <div className="h-full flex flex-col bg-surface-0">
      {/* Header */}
      <div className="bg-surface-1 border-b border-white/[0.06] p-3 md:p-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-[15px] md:text-[17px] font-semibold text-slate-100 flex-shrink-0">Sessions</h1>
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-surface-2 text-slate-200 rounded-xl pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500/40 border border-white/[0.06] placeholder:text-slate-600"
            />
          </div>
        </div>
      </div>

      {/* Sessions list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 md:px-5 md:py-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="text-violet-400 animate-spin" />
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center text-slate-500 py-8 text-[13px]">
            {searchQuery ? 'No matching sessions' : 'No sessions yet'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => navigate(`/chat/${session.id}`)}
                className="bg-surface-1 rounded-xl p-3.5 md:p-4 border border-white/[0.04] active:border-violet-500/30 md:hover:border-violet-500/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={17} className="text-violet-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-medium text-slate-200 truncate">
                      {session.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-500">{session.message_count} msgs</span>
                      <span className="text-[11px] text-slate-600">
                        {new Date(session.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Desktop actions */}
                  <div className="hidden md:flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleExport(session, e)}
                      className="p-2 bg-surface-2 text-slate-400 rounded-lg hover:bg-white/[0.06] transition-colors"
                      title="Export"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(session.id, e)}
                      className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Mobile chevron */}
                  <ChevronRight size={16} className="md:hidden text-slate-600 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
