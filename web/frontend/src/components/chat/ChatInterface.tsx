import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useChat } from '../../hooks/useChat';
import { useWebSocket } from '../../hooks/useWebSocket';
import { Plus, Trash2, MessageSquare, X } from 'lucide-react';
import clsx from 'clsx';

export const ChatInterface = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const {
    sessions,
    currentSessionId,
    messages,
    isStreaming,
    streamingContent,
    selectSession,
    createSession,
    deleteSession,
  } = useChat();
  const { sendMessage } = useWebSocket();
  const [showSessionDrawer, setShowSessionDrawer] = useState(false);

  useEffect(() => {
    if (sessionId && sessionId !== currentSessionId) {
      selectSession(sessionId);
    }
  }, [sessionId, currentSessionId, selectSession]);

  useEffect(() => {
    setShowSessionDrawer(false);
  }, [currentSessionId]);

  const handleCreateSession = async () => {
    const id = await createSession();
    navigate(`/chat/${id}`);
  };

  const handleSelectSession = (id: string) => {
    navigate(`/chat/${id}`);
    setShowSessionDrawer(false);
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this session?')) {
      await deleteSession(id);
      if (currentSessionId === id) {
        navigate('/chat');
      }
    }
  };

  return (
    <div className="flex h-full">
      {/* ── Desktop sessions sidebar ── */}
      <div className="hidden md:flex w-60 bg-surface-1 border-r border-white/[0.06] flex-col flex-shrink-0">
        <div className="p-3 border-b border-white/[0.06]">
          <button
            onClick={handleCreateSession}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-500 text-white rounded-xl text-[13px] font-semibold hover:bg-violet-600 active:bg-violet-700 transition-colors"
          >
            <Plus size={16} strokeWidth={2} />
            <span>New Chat</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => handleSelectSession(session.id)}
              className={clsx(
                'w-full text-left p-3 rounded-xl mb-0.5 transition-all group relative',
                currentSessionId === session.id
                  ? 'bg-violet-500/15 text-violet-300'
                  : 'text-slate-400 hover:bg-white/[0.04]'
              )}
            >
              <div className="pr-7">
                <div className="font-medium text-[13px] truncate">{session.title}</div>
                <div className="text-[11px] opacity-60 mt-0.5">{session.message_count} messages</div>
              </div>
              <button
                onClick={(e) => handleDeleteSession(session.id, e)}
                className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all"
              >
                <Trash2 size={13} />
              </button>
            </button>
          ))}
          {sessions.length === 0 && (
            <div className="text-center text-slate-500 text-[12px] mt-8 px-4">No sessions yet</div>
          )}
        </div>
      </div>

      {/* ── Mobile session bottom sheet backdrop ── */}
      <div
        className={clsx(
          'md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          showSessionDrawer ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setShowSessionDrawer(false)}
      />

      {/* ── Mobile session bottom sheet ── */}
      <div
        className={clsx(
          'md:hidden fixed inset-x-0 bottom-0 z-40 bg-surface-1 border-t border-white/[0.06] rounded-t-2xl',
          'transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          'max-h-[70dvh] flex flex-col',
          showSessionDrawer ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <div className="flex items-center justify-center pt-2 pb-1">
          <div className="w-8 h-1 rounded-full bg-slate-600" />
        </div>
        <div className="flex items-center justify-between px-4 pb-3">
          <h3 className="text-[15px] font-semibold text-slate-200">Sessions</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateSession}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-violet-500 text-white rounded-xl text-[13px] font-semibold active:bg-violet-700"
            >
              <Plus size={15} strokeWidth={2} />
              <span>New</span>
            </button>
            <button onClick={() => setShowSessionDrawer(false)} className="p-2 rounded-xl text-slate-400 active:bg-white/[0.08]">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4 safe-bottom">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => handleSelectSession(session.id)}
              className={clsx(
                'w-full text-left px-4 py-3.5 rounded-xl mb-1 transition-all flex items-center gap-3',
                currentSessionId === session.id
                  ? 'bg-violet-500/15 text-violet-300'
                  : 'text-slate-400 active:bg-white/[0.06]'
              )}
            >
              <MessageSquare size={16} className="flex-shrink-0 opacity-50" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-[14px] truncate">{session.title}</div>
                <div className="text-[11px] opacity-60 mt-0.5">{session.message_count} messages</div>
              </div>
            </button>
          ))}
          {sessions.length === 0 && (
            <div className="text-center text-slate-500 text-[13px] py-8">No sessions yet</div>
          )}
        </div>
      </div>

      {/* ── Chat area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {currentSessionId ? (
          <>
            {/* Mobile session bar */}
            <div className="md:hidden flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-surface-1/50 flex-shrink-0">
              <button
                onClick={() => setShowSessionDrawer(true)}
                className="flex items-center gap-2 text-[13px] text-slate-400 active:text-slate-200"
              >
                <MessageSquare size={14} />
                <span className="truncate max-w-[200px]">
                  {sessions.find(s => s.id === currentSessionId)?.title || 'Session'}
                </span>
              </button>
              <button onClick={handleCreateSession} className="p-1.5 rounded-lg text-slate-500 active:bg-white/[0.08]">
                <Plus size={18} />
              </button>
            </div>
            <MessageList messages={messages} isStreaming={isStreaming} streamingContent={streamingContent} />
            <MessageInput onSend={sendMessage} disabled={isStreaming} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-500/10 mb-4">
                <MessageSquare size={24} className="text-violet-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-200 mb-2">Start a conversation</h2>
              <p className="text-[13px] text-slate-500 mb-5 max-w-[260px] mx-auto">
                Create a new chat session to talk with Hermes Agent
              </p>
              <button
                onClick={handleCreateSession}
                className="px-5 py-2.5 bg-violet-500 text-white rounded-xl text-[14px] font-semibold hover:bg-violet-600 active:bg-violet-700 transition-colors"
              >
                New Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
