import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { Message } from '../../types';
import { Bot } from 'lucide-react';

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
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
      {messages.length === 0 && !isStreaming && (
        <div className="flex flex-col items-center justify-center h-full text-zinc-500">
          <p className="text-[14px] font-serif italic">No messages yet</p>
          <p className="text-[12px] mt-1 text-zinc-600">Start a conversation with Hermes Agent</p>
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {isStreaming && (
        <div className="flex gap-2.5 mb-4">
          <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <div className="w-1 h-1 rounded-full bg-brand animate-pulse-dot" />
          </div>
          <div className="max-w-[85%] md:max-w-2xl px-4 py-3 rounded-xl rounded-tl-md bg-surface-2 text-zinc-200">
            <div className="text-[14px] leading-relaxed whitespace-pre-wrap">
              {streamingContent}
              <span className="inline-block w-1.5 h-4 bg-brand ml-0.5 animate-pulse rounded-sm" />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
