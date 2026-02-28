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
    <div className="border-t border-white/[0.06] bg-[#0c0c14] px-4 py-3 md:px-6 md:py-4 flex-shrink-0">
      <div className="flex items-end gap-3 max-w-3xl mx-auto">
        <div className="flex-1 relative bg-[#111119] rounded-2xl border border-white/[0.08] focus-within:border-[#c9956a]/25 transition-all duration-300">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Hermes..."
            disabled={disabled}
            rows={1}
            className="w-full bg-transparent text-zinc-100 px-4 py-3 pr-14 text-[15px] resize-none focus:outline-none placeholder:text-zinc-500 disabled:opacity-40 leading-relaxed scrollbar-hide font-outfit"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            className="absolute right-2 bottom-2 flex items-center justify-center w-9 h-9 bg-gradient-brand text-[#0a0a0f] rounded-full active:scale-90 transition-transform duration-150 disabled:opacity-30 disabled:pointer-events-none disabled:scale-100"
          >
            <ArrowUp size={17} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
