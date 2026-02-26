import { useState } from 'react';
import { ChevronDown, ChevronRight, Wrench } from 'lucide-react';
import { ToolCall } from '../../types';

interface ToolCallCardProps {
  toolCall: ToolCall;
}

export const ToolCallCard = ({ toolCall }: ToolCallCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-surface-3 my-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2.5 p-3 active:bg-surface-2 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-brand/15 flex items-center justify-center flex-shrink-0">
          <Wrench size={13} className="text-brand" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="font-mono text-[12px] text-brand truncate">{toolCall.name}</div>
          {toolCall.result && (
            <div className="text-[11px] text-zinc-500 mt-0.5 uppercase tracking-widest">Executed</div>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown size={16} className="text-zinc-500" />
        ) : (
          <ChevronRight size={16} className="text-zinc-500" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-border p-3 space-y-2.5">
          <div>
            <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1">Arguments</div>
            <pre className="bg-surface-1 rounded-lg p-2.5 text-[11px] text-zinc-400 overflow-x-auto font-mono border border-border">
              {JSON.stringify(JSON.parse(toolCall.arguments || '{}'), null, 2)}
            </pre>
          </div>
          {toolCall.result && (
            <div>
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1">Result</div>
              <div className="bg-surface-1 rounded-lg p-2.5 text-[11px] text-zinc-400 break-words border border-border">
                {toolCall.result}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
