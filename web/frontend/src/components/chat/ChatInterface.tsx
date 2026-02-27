import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useChat } from '../../hooks/useChat';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useConfirmStore } from '../ConfirmDialog';
import { useToastStore } from '../../store/toast';
import { wsClient, ConnectionStatus } from '../../services/websocket';
import { Plus, Trash2, MessageSquare, X, WifiOff, Loader2 } from 'lucide-react';
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
  const confirm = useConfirmStore((s) => s.open);
  const addToast = useToastStore((s) => s.addToast);
  const [showSessionDrawer, setShowSessionDrawer] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const [wsStatus, setWsStatus] = useState<ConnectionStatus>(wsClient.status);

  useEffect(() => {
    return wsClient.onStatusChange(setWsStatus);
  }, []);

  useEffect(() => {
    if (sessionId && sessionId !== currentSessionId) {
      let cancelled = false;
      setLoadingSession(true);
      selectSession(sessionId).finally(() => {
        if (!cancelled) setLoadingSession(false);
      });
      return () => { cancelled = true; };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  useEffect(() => {
    setShowSessionDrawer(false);
  }, [currentSessionId]);

  // Lock scroll when session drawer open
  useEffect(() => {
    if (showSessionDrawer) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showSessionDrawer]);

  const handleCreateSession = async () => {
    try {
      const id = await createSession();
      navigate(`/chat/${id}`);
    } catch {
      addToast('error', 'Failed to create session');
    }
  };

  const handleSelectSession = (id: string) => {
    navigate(`/chat/${id}`);
    setShowSessionDrawer(false);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    confirm({
      title: 'Delete Session',
      message: 'This session and all its messages will be permanently deleted.',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        try {
          await deleteSession(id);
          if (currentSessionId === id) {
            navigate('/chat');
          }
          addToast('success', 'Session deleted');
        } catch {
          addToast('error', 'Failed to delete session');
        }
      },
    });
  };

  const connectionIndicator = wsStatus !== 'connected' && (
    <div className={clsx(
      'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide',
      wsStatus === 'connecting'
        ? 'bg-[#c9956a]/10 text-[#c9956a] ring-1 ring-[#c9956a]/20 animate-glow-pulse'
        : 'bg-[#e0796b]/10 text-[#e0796b] ring-1 ring-[#e0796b]/20'
    )}>
      {wsStatus === 'connecting' ? (
        <Loader2 size={11} className="animate-spin" />
      ) : (
        <WifiOff size={11} />
      )}
      <span>{wsStatus === 'connecting' ? 'Reconnecting' : 'Offline'}</span>
    </div>
  );

  return (
    <div className="flex h-full">
      {/* ── Desktop sessions sidebar ── */}
      <div className="hidden md:flex w-56 glass gradient-border flex-col flex-shrink-0">
        <div className="p-3 border-b border-[#c9956a]/10">
          <button
            onClick={handleCreateSession}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 gradient-border text-[#c9956a] rounded-xl text-[13px] font-semibold tracking-wide hover:bg-[#c9956a]/5 transition-all duration-300"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>New Chat</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => handleSelectSession(session.id)}
              className={clsx(
                'w-full text-left p-3 rounded-lg mb-1.5 transition-all duration-300 group relative border-l-2',
                currentSessionId === session.id
                  ? 'bg-[#16161f] text-zinc-100 border-[#c9956a] shadow-lg shadow-[#c9956a]/5'
                  : 'text-zinc-400 hover:bg-[#16161f] border-transparent ambient-glow'
              )}
            >
              <div className="pr-8">
                <div className="font-medium text-[13px] truncate">{session.title}</div>
                <div className="text-[11px] text-zinc-500 mt-0.5">{session.message_count} messages</div>
              </div>
              <button
                onClick={(e) => handleDeleteSession(session.id, e)}
                className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 p-1 hover:bg-[#e0796b]/10 hover:text-[#e0796b] rounded-lg transition-all duration-300"
              >
                <Trash2 size={13} />
              </button>
            </button>
          ))}
          {sessions.length === 0 && (
            <div className="text-center text-zinc-500 text-[12px] mt-8 px-4">No sessions yet</div>
          )}
        </div>

        {/* Desktop connection status */}
        {wsStatus !== 'connected' && (
          <div className="p-3 border-t border-[#c9956a]/10">
            {connectionIndicator}
          </div>
        )}
      </div>

      {/* ── Mobile session bottom sheet backdrop ── */}
      <div
        className={clsx(
          'md:hidden fixed inset-0 z-30 bg-black/70 backdrop-blur-sm transition-opacity duration-300',
          showSessionDrawer ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setShowSessionDrawer(false)}
      />

      {/* ── Mobile session bottom sheet ── */}
      <div
        className={clsx(
          'md:hidden fixed inset-x-0 bottom-0 z-40 glass-strong border-t border-[#c9956a]/10 rounded-t-2xl',
          'transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          'max-h-[75dvh] flex flex-col',
          showSessionDrawer ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <div className="drag-handle" />
        <div className="flex items-center justify-between px-4 pb-3">
          <h3 className="text-[15px] font-semibold text-zinc-100 tracking-wide font-outfit">Sessions</h3>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCreateSession}
              className="flex items-center gap-1.5 px-3 py-2 gradient-border text-[#c9956a] rounded-xl text-[13px] font-semibold tracking-wide active:bg-[#c9956a]/5"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>New</span>
            </button>
            <button onClick={() => setShowSessionDrawer(false)} className="p-2 rounded-xl text-zinc-400 active:bg-[#16161f]">
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-6 scrollbar-hide modal-scroll">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => handleSelectSession(session.id)}
              className={clsx(
                'w-full text-left px-4 py-3.5 rounded-xl mb-1.5 transition-all flex items-center gap-3 border-l-2',
                currentSessionId === session.id
                  ? 'bg-[#16161f] text-zinc-100 border-[#c9956a]'
                  : 'text-zinc-400 active:bg-[#16161f] border-transparent'
              )}
            >
              <MessageSquare size={16} className="flex-shrink-0 opacity-40" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-[14px] truncate">{session.title}</div>
                <div className="text-[11px] text-zinc-500 mt-0.5">{session.message_count} messages</div>
              </div>
            </button>
          ))}
          {sessions.length === 0 && (
            <div className="text-center text-zinc-500 text-[13px] py-8">No sessions yet</div>
          )}
        </div>
      </div>

      {/* ── Chat area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {currentSessionId ? (
          <>
            {/* Mobile session bar */}
            <div className="md:hidden flex items-center justify-between px-3 py-2 border-b border-[#c9956a]/10 glass flex-shrink-0">
              <button
                onClick={() => setShowSessionDrawer(true)}
                className="flex items-center gap-2 text-[13px] text-zinc-300 active:text-zinc-100 transition-colors py-1.5 pr-2"
              >
                <MessageSquare size={15} className="text-zinc-500" />
                <span className="truncate max-w-[180px] font-medium">
                  {sessions.find(s => s.id === currentSessionId)?.title || 'Session'}
                </span>
              </button>
              <div className="flex items-center gap-1.5">
                {connectionIndicator}
                <button onClick={handleCreateSession} className="p-2 rounded-xl text-zinc-500 active:bg-[#16161f] transition-colors">
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {loadingSession ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 size={28} className="text-[#c9956a] animate-spin animate-glow-pulse" />
              </div>
            ) : (
              <MessageList messages={messages} isStreaming={isStreaming} streamingContent={streamingContent} />
            )}
            <MessageInput onSend={sendMessage} disabled={isStreaming || wsStatus !== 'connected'} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center animate-fade-in-scale">
              <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-brand mb-5 animate-float shadow-2xl shadow-[#c9956a]/20">
                <MessageSquare size={24} className="text-[#0a0a0f]" strokeWidth={2.5} />
              </div>
              <h2 className="text-lg md:text-xl font-serif font-semibold text-gradient mb-2">Start a conversation</h2>
              <p className="text-[13px] text-zinc-400 mb-6 max-w-[260px] mx-auto leading-relaxed">
                Create a new session to talk with Hermes Agent
              </p>
              <button
                onClick={handleCreateSession}
                className="px-6 py-3 bg-gradient-brand text-[#0a0a0f] rounded-xl text-[14px] font-semibold tracking-wide hover:shadow-xl hover:shadow-[#c9956a]/20 active:scale-95 transition-all duration-300"
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
