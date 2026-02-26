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
    <div className="flex-1 overflow-y-auto px-3 py-4 md:px-8 md:py-10 scrollbar-hide">
      {messages.length === 0 && !isStreaming && (
        <div className="flex flex-col items-center justify-center h-full text-zinc-500 animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-gradient-brand flex items-center justify-center mb-4 animate-float shadow-xl shadow-[#c9956a]/10">
            <Bot size={20} className="text-[#0a0a0f]" strokeWidth={2.5} />
          </div>
          <p className="text-lg font-serif italic text-gradient mb-1">No messages yet</p>
          <p className="text-[12px] text-zinc-600">Start a conversation with Hermes Agent</p>
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {isStreaming && (
        <div className="flex gap-3 mb-5 animate-fade-in">
          <div className="w-7 h-7 rounded-full gradient-border bg-gradient-brand flex items-center justify-center flex-shrink-0 mt-0.5 ambient-glow-strong">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0a0a0f] animate-pulse-dot" />
          </div>
          <div className="max-w-[85%] md:max-w-2xl px-4 py-3.5 rounded-2xl rounded-tl-md glass gradient-border text-zinc-200 shadow-xl">
            <div className="text-[14px] leading-relaxed whitespace-pre-wrap">
              {streamingContent}
              <span className="inline-block w-1.5 h-4 bg-[#c9956a] ml-0.5 rounded-sm animate-typing-cursor" />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
