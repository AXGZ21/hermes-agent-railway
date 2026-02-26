import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useChat } from '../../hooks/useChat';
import { useWebSocket } from '../../hooks/useWebSocket';
import { Plus, Trash2 } from 'lucide-react';
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
  const [showSessions] = useState(true);

  useEffect(() => {
    if (sessionId && sessionId !== currentSessionId) {
      selectSession(sessionId);
    }
  }, [sessionId, currentSessionId, selectSession]);

  const handleCreateSession = async () => {
    const id = await createSession();
    navigate(`/chat/${id}`);
  };

  const handleSelectSession = (id: string) => {
    navigate(`/chat/${id}`);
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
      {/* Sessions Sidebar */}
      <div
        className={clsx(
          'bg-slate-900 border-r border-slate-700 flex flex-col transition-all',
          showSessions ? 'w-64' : 'w-0 overflow-hidden'
        )}
      >
        <div className="p-4 border-b border-slate-700">
          <button
            onClick={handleCreateSession}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
          >
            <Plus size={18} />
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => handleSelectSession(session.id)}
              className={clsx(
                'w-full text-left p-3 rounded-lg mb-1 transition-colors group relative',
                currentSessionId === session.id
                  ? 'bg-violet-500 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              )}
            >
              <div className="pr-8">
                <div className="font-medium text-sm truncate">{session.title}</div>
                <div className="text-xs opacity-70 mt-1">
                  {session.message_count} messages
                </div>
              </div>

              <button
                onClick={(e) => handleDeleteSession(session.id, e)}
                className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500 rounded transition-all"
              >
                <Trash2 size={14} />
              </button>
            </button>
          ))}

          {sessions.length === 0 && (
            <div className="text-center text-slate-400 text-sm mt-8">
              No sessions yet
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentSessionId ? (
          <>
            <MessageList
              messages={messages}
              isStreaming={isStreaming}
              streamingContent={streamingContent}
            />
            <MessageInput onSend={sendMessage} disabled={isStreaming} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-300 mb-4">
                Welcome to Hermes Agent
              </h2>
              <p className="text-slate-400 mb-6">
                Create a new chat session to get started
              </p>
              <button
                onClick={handleCreateSession}
                className="px-6 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
              >
                Start New Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
