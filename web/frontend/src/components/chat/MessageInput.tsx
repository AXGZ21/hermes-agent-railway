import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { ArrowUp } from 'lucide-react';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const MessageInput = ({ onSend, disabled }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 160) + 'px';
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-surface-1/50 backdrop-blur-xl px-4 py-3 md:px-6 md:py-4 flex-shrink-0">
      <div className="flex items-end gap-3 max-w-3xl mx-auto relative">
        <div className="flex-1 relative bg-surface-2 rounded-xl border border-border">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Hermes..."
            disabled={disabled}
            rows={1}
            className="w-full bg-transparent text-zinc-100 px-4 py-3 pr-12 text-[15px] resize-none focus:outline-none placeholder:text-zinc-600 disabled:opacity-40 leading-relaxed"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            className="absolute right-2 bottom-2 flex items-center justify-center w-8 h-8 bg-brand text-surface-0 rounded-full hover:bg-brand-light transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <ArrowUp size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
