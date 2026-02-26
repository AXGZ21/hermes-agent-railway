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
    <div className="border-t border-white/[0.06] bg-surface-1/50 backdrop-blur-xl px-3 py-2.5 md:px-4 md:py-3 flex-shrink-0">
      <div className="flex items-end gap-2 max-w-3xl mx-auto">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Hermes..."
          disabled={disabled}
          rows={1}
          className="flex-1 bg-surface-2 text-slate-100 rounded-2xl px-4 py-2.5 text-[15px] resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/40 border border-white/[0.06] placeholder:text-slate-600 disabled:opacity-40 leading-relaxed"
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-violet-500 text-white rounded-full hover:bg-violet-600 active:bg-violet-700 transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          <ArrowUp size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};
