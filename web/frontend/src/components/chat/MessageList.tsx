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
    <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
      {messages.length === 0 && !isStreaming && (
        <div className="flex flex-col items-center justify-center h-full text-slate-500">
          <p className="text-[14px]">No messages yet</p>
          <p className="text-[12px] mt-1">Start a conversation with Hermes Agent</p>
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {isStreaming && (
        <div className="flex gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Loader2 size={14} className="text-violet-400 animate-spin" />
          </div>
          <div className="max-w-[85%] md:max-w-2xl px-3.5 py-2.5 rounded-2xl rounded-tl-md bg-surface-2 text-slate-200">
            <div className="text-[14px] leading-relaxed whitespace-pre-wrap">
              {streamingContent}
              <span className="inline-block w-1.5 h-4 bg-violet-400 ml-0.5 animate-pulse rounded-sm" />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
