import { Message } from '../../types';
import { User, Bot } from 'lucide-react';
import clsx from 'clsx';

interface MessageBubbleProps {
  message: Message;
}

const formatContent = (content: string) => {
  const parts: React.JSX.Element[] = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index);
      parts.push(<span key={`text-${lastIndex}`}>{formatInlineText(text)}</span>);
    }

    // Add code block
    const language = match[1] || 'text';
    const code = match[2];
    parts.push(
      <div key={`code-${match.index}`} className="my-2">
        <div className="bg-slate-950 rounded-lg overflow-hidden">
          <div className="bg-slate-900 px-3 py-1 text-xs text-slate-400 flex items-center justify-between">
            <span>{language}</span>
            <button
              onClick={() => navigator.clipboard.writeText(code)}
              className="text-slate-400 hover:text-slate-200 text-xs"
            >
              Copy
            </button>
          </div>
          <pre className="p-4 overflow-x-auto">
            <code className="text-sm text-slate-200 font-mono">{code}</code>
          </pre>
        </div>
      </div>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    const text = content.slice(lastIndex);
    parts.push(<span key={`text-${lastIndex}`}>{formatInlineText(text)}</span>);
  }

  return parts;
};

const formatInlineText = (text: string) => {
  // Split by newlines and handle bold/italic
  return text.split('\n').map((line, i) => (
    <span key={i}>
      {i > 0 && <br />}
      {formatInlineStyles(line)}
    </span>
  ));
};

const formatInlineStyles = (text: string) => {
  // Handle **bold** and *italic*
  const parts: (string | React.JSX.Element)[] = [];
  const boldRegex = /\*\*(.+?)\*\*/g;
  const italicRegex = /\*(.+?)\*/g;

  let processed = text;

  // Replace bold
  processed = processed.replace(boldRegex, '|||BOLD_START|||$1|||BOLD_END|||');

  // Replace italic (but not already processed bold markers)
  processed = processed.replace(italicRegex, (match, p1) => {
    if (match.includes('|||')) return match;
    return `|||ITALIC_START|||${p1}|||ITALIC_END|||`;
  });

  const tokens = processed.split('|||');

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === 'BOLD_START') {
      i++;
      parts.push(<strong key={i} className="font-bold">{tokens[i]}</strong>);
      i++; // Skip BOLD_END
    } else if (token === 'ITALIC_START') {
      i++;
      parts.push(<em key={i} className="italic">{tokens[i]}</em>);
      i++; // Skip ITALIC_END
    } else if (token && !token.includes('_END')) {
      parts.push(token);
    }
  }

  return parts;
};

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-slate-800 text-slate-400 text-sm px-4 py-2 rounded-lg">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('flex gap-3 mb-4', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0">
          <Bot size={18} className="text-white" />
        </div>
      )}

      <div
        className={clsx(
          'max-w-3xl px-4 py-3 rounded-lg',
          isUser
            ? 'bg-violet-500 text-white'
            : 'bg-slate-800 text-slate-100'
        )}
      >
        <div className="prose prose-invert max-w-none">
          {formatContent(message.content)}
        </div>

        {message.tool_calls && message.tool_calls.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.tool_calls.map((tool, idx) => (
              <div key={idx} className="bg-slate-900 rounded p-2 text-xs">
                <div className="text-cyan-400 font-mono">{tool.name}</div>
                {tool.result && (
                  <div className="text-slate-400 mt-1">{tool.result}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
          <User size={18} className="text-slate-300" />
        </div>
      )}
    </div>
  );
};
