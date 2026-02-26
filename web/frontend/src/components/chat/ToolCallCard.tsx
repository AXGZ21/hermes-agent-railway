import { useState } from 'react';
import { ChevronDown, ChevronRight, Wrench } from 'lucide-react';
import { ToolCall } from '../../types';

interface ToolCallCardProps {
  toolCall: ToolCall;
}

export const ToolCallCard = ({ toolCall }: ToolCallCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-cyan-500 rounded-lg overflow-hidden bg-slate-900 my-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 p-3 hover:bg-slate-800 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
          <Wrench size={16} className="text-white" />
        </div>

        <div className="flex-1 text-left">
          <div className="font-mono text-sm text-cyan-400">{toolCall.name}</div>
          {toolCall.result && (
            <div className="text-xs text-slate-400 mt-1">Tool executed successfully</div>
          )}
        </div>

        {isExpanded ? (
          <ChevronDown size={20} className="text-slate-400" />
        ) : (
          <ChevronRight size={20} className="text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-cyan-500 p-4 space-y-3">
          <div>
            <div className="text-xs font-semibold text-slate-400 mb-1">Arguments</div>
            <pre className="bg-slate-950 rounded p-3 text-xs text-slate-300 overflow-x-auto font-mono">
              {JSON.stringify(JSON.parse(toolCall.arguments || '{}'), null, 2)}
            </pre>
          </div>

          {toolCall.result && (
            <div>
              <div className="text-xs font-semibold text-slate-400 mb-1">Result</div>
              <div className="bg-slate-950 rounded p-3 text-xs text-slate-300">
                {toolCall.result}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
