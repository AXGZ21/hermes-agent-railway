import { useState } from 'react';
import { ChevronDown, ChevronRight, Wrench } from 'lucide-react';
import { ToolCall } from '../../types';

interface ToolCallCardProps {
  toolCall: ToolCall;
}

export const ToolCallCard = ({ toolCall }: ToolCallCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-cyan-500/20 rounded-xl overflow-hidden bg-surface-1 my-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2.5 p-3 active:bg-white/[0.04] transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-cyan-500/15 flex items-center justify-center flex-shrink-0">
          <Wrench size={13} className="text-cyan-400" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="font-mono text-[12px] text-cyan-400 truncate">{toolCall.name}</div>
          {toolCall.result && (
            <div className="text-[11px] text-slate-500 mt-0.5">Executed</div>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown size={16} className="text-slate-500" />
        ) : (
          <ChevronRight size={16} className="text-slate-500" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-cyan-500/10 p-3 space-y-2.5">
          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Arguments</div>
            <pre className="bg-black/20 rounded-lg p-2.5 text-[11px] text-slate-400 overflow-x-auto font-mono">
              {JSON.stringify(JSON.parse(toolCall.arguments || '{}'), null, 2)}
            </pre>
          </div>
          {toolCall.result && (
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Result</div>
              <div className="bg-black/20 rounded-lg p-2.5 text-[11px] text-slate-400 break-words">
                {toolCall.result}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
