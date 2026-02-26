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
        <div className="bg-black/30 rounded-xl overflow-hidden border border-white/[0.04]">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.04]">
            <span className="text-[10px] text-slate-500 font-mono">{language}</span>
            <button
              onClick={() => navigator.clipboard.writeText(code)}
              className="text-[10px] text-slate-500 hover:text-slate-300 active:text-white px-2 py-0.5 rounded"
            >
              Copy
            </button>
          </div>
          <pre className="p-3 overflow-x-auto">
            <code className="text-[12px] md:text-[13px] text-slate-300 font-mono leading-relaxed">{code}</code>
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
        <code key={m.index} className="bg-black/20 text-violet-300 px-1.5 py-0.5 rounded text-[12px] font-mono">
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
        <div className="bg-surface-2 text-slate-500 text-[12px] px-3 py-1.5 rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('flex gap-2.5 mb-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot size={14} className="text-violet-400" />
        </div>
      )}

      <div
        className={clsx(
          'max-w-[85%] md:max-w-2xl px-3.5 py-2.5 rounded-2xl',
          isUser
            ? 'bg-violet-500 text-white rounded-tr-md'
            : 'bg-surface-2 text-slate-200 rounded-tl-md'
        )}
      >
        <div className="text-[14px] leading-relaxed">
          {formatContent(message.content)}
        </div>

        {message.tool_calls && message.tool_calls.length > 0 && (
          <div className="mt-2.5 space-y-1.5">
            {message.tool_calls.map((tool, idx) => (
              <div key={idx} className="bg-black/20 rounded-lg px-2.5 py-2 border border-white/[0.04]">
                <div className="text-cyan-400 font-mono text-[11px]">{tool.name}</div>
                {tool.result && (
                  <div className="text-slate-400 text-[11px] mt-1 truncate">{tool.result}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-7 h-7 rounded-full bg-surface-3 flex items-center justify-center flex-shrink-0 mt-0.5">
          <User size={14} className="text-slate-400" />
        </div>
      )}
    </div>
  );
};
