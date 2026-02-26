import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { Message } from '../../types';
import { Loader2 } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
}

export const MessageList = ({ messages, isStreaming, streamingContent }: MessageListProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {messages.length === 0 && !isStreaming && (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
          <p className="text-lg mb-2">No messages yet</p>
          <p className="text-sm">Start a conversation with Hermes Agent</p>
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {isStreaming && (
        <div className="flex gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0">
            <Loader2 size={18} className="text-white animate-spin" />
          </div>

          <div className="max-w-3xl px-4 py-3 rounded-lg bg-slate-800 text-slate-100">
            <div className="prose prose-invert max-w-none whitespace-pre-wrap">
              {streamingContent}
              <span className="inline-block w-2 h-4 bg-violet-400 ml-1 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
