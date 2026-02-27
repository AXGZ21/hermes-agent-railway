import { useState } from 'react';
import { ChevronDown, ChevronRight, Wrench } from 'lucide-react';
import { ToolCall } from '../../types';

interface ToolCallCardProps {
  toolCall: ToolCall;
}

export const ToolCallCard = ({ toolCall }: ToolCallCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="gradient-border rounded-xl overflow-hidden bg-[#0f0f16] my-3 ambient-glow transition-all duration-300">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 p-3 hover:bg-[#16161f] active:bg-[#16161f] transition-all duration-300"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#c9956a]/20">
          <Wrench size={14} className="text-[#0a0a0f]" strokeWidth={2.5} />
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="font-mono text-[12px] text-[#c9956a] truncate font-semibold">{toolCall.name}</div>
          {toolCall.result && (
            <div className="text-[11px] text-zinc-500 mt-0.5 uppercase tracking-widest font-medium">Executed</div>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown size={16} className="text-zinc-500 transition-transform duration-300" />
        ) : (
          <ChevronRight size={16} className="text-zinc-500 transition-transform duration-300" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-[#c9956a]/10 p-3.5 space-y-3 animate-fade-in">
          <div>
            <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5">Arguments</div>
            <pre className="bg-[#0a0a0f] rounded-lg p-3 text-[11px] text-zinc-400 overflow-x-auto font-mono gradient-border scrollbar-hide">
              {JSON.stringify(JSON.parse(toolCall.arguments || '{}'), null, 2)}
            </pre>
          </div>
          {toolCall.result && (
            <div>
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5">Result</div>
              <div className="bg-[#0a0a0f] rounded-lg p-3 text-[11px] text-zinc-400 break-words gradient-border font-mono">
                {toolCall.result}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
