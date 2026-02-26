import { Message } from '../../types';
import { User, Bot } from 'lucide-react';
import clsx from 'clsx';

interface MessageBubbleProps {
  message: Message;
}

const escapeHtml = (str: string) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const formatContent = (content: string) => {
  const parts: React.JSX.Element[] = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index);
      parts.push(<span key={`text-${lastIndex}`}>{formatInlineText(text)}</span>);
    }

    const language = escapeHtml(match[1] || 'text');
    const code = match[2];
    parts.push(
      <div key={`code-${match.index}`} className="my-2 -mx-1">
        <div className="bg-surface-1 rounded-xl overflow-hidden border border-border">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">{language}</span>
            <button
              onClick={() => navigator.clipboard.writeText(code)}
              className="text-[10px] text-zinc-500 hover:text-zinc-300 active:text-brand px-2 py-0.5 rounded"
            >
              Copy
            </button>
          </div>
          <pre className="p-3 overflow-x-auto">
            <code className="text-[12px] md:text-[13px] text-zinc-300 font-mono leading-relaxed">{code}</code>
          </pre>
        </div>
      </div>
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    const text = content.slice(lastIndex);
    parts.push(<span key={`text-${lastIndex}`}>{formatInlineText(text)}</span>);
  }

  return parts;
};

const formatInlineText = (text: string) => {
  return text.split('\n').map((line, i) => (
    <span key={i}>
      {i > 0 && <br />}
      {formatInlineStyles(line)}
    </span>
  ));
};

const formatInlineStyles = (text: string) => {
  const parts: (string | React.JSX.Element)[] = [];
  // Match inline code, bold, then italic - in order of priority
  const regex = /`([^`]+)`|\*\*(.+?)\*\*|\*(.+?)\*/g;
  let lastIdx = 0;
  let m;

  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIdx) {
      parts.push(text.slice(lastIdx, m.index));
    }

    if (m[1] !== undefined) {
      // Inline code
      parts.push(
        <code key={m.index} className="bg-black/30 text-brand px-1.5 py-0.5 rounded text-[12px] font-mono">
          {m[1]}
        </code>
      );
    } else if (m[2] !== undefined) {
      // Bold
      parts.push(<strong key={m.index} className="font-semibold">{m[2]}</strong>);
    } else if (m[3] !== undefined) {
      // Italic
      parts.push(<em key={m.index} className="italic">{m[3]}</em>);
    }

    lastIdx = m.index + m[0].length;
  }

  if (lastIdx < text.length) {
    parts.push(text.slice(lastIdx));
  }

  return parts;
};

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <div className="bg-surface-3 text-zinc-500 text-[12px] px-3 py-1.5 rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('flex gap-2.5 mb-4', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot size={13} className="text-brand" />
        </div>
      )}

      <div
        className={clsx(
          'max-w-[85%] md:max-w-2xl px-4 py-3 rounded-xl',
          isUser
            ? 'bg-brand text-surface-0 rounded-tr-md'
            : 'bg-surface-2 text-zinc-200 rounded-tl-md'
        )}
      >
        <div className="text-[14px] leading-relaxed">
          {formatContent(message.content)}
        </div>

        {message.tool_calls && message.tool_calls.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.tool_calls.map((tool, idx) => (
              <div key={idx} className="bg-surface-3 rounded-lg px-3 py-2 border border-border">
                <div className="text-brand font-mono text-[11px] uppercase tracking-widest">{tool.name}</div>
                {tool.result && (
                  <div className="text-zinc-400 text-[11px] mt-1 truncate">{tool.result}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-6 h-6 rounded-full bg-surface-3 flex items-center justify-center flex-shrink-0 mt-0.5">
          <User size={13} className="text-zinc-400" />
        </div>
      )}
    </div>
  );
};
