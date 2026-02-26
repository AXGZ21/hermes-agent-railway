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
    <div className="glass-strong border-t border-[#c9956a]/10 px-3 py-3 md:px-6 md:py-5 flex-shrink-0 relative safe-bottom">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9956a]/20 to-transparent" />
      <div className="flex items-end gap-3 max-w-3xl mx-auto relative">
        <div className="flex-1 relative bg-[#16161f] rounded-xl gradient-border focus-within:ambient-glow transition-all duration-300">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Hermes Agent..."
            disabled={disabled}
            rows={1}
            className="w-full bg-transparent text-zinc-100 px-4 py-3.5 pr-16 text-[15px] resize-none focus:outline-none placeholder:text-zinc-500 disabled:opacity-40 leading-relaxed scrollbar-hide"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            className="absolute right-2 bottom-2 flex items-center justify-center w-10 h-10 md:w-9 md:h-9 bg-gradient-brand text-[#0a0a0f] rounded-full hover:scale-110 hover:shadow-xl hover:shadow-[#c9956a]/30 active:scale-95 transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none disabled:scale-100"
          >
            <ArrowUp size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
