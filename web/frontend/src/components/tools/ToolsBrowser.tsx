import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Tool } from '../../types';
import { useToastStore } from '../../store/toast';
import { Search, Loader2 } from 'lucide-react';
import clsx from 'clsx';

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  web: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  browser: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  terminal: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  file: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  vision: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  skills: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
  moa: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  planning: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  memory: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  session: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/30' },
  cronjob: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  tts: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30' },
  rl: { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400', border: 'border-fuchsia-500/30' },
  messaging: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' },
  interaction: { bg: 'bg-lime-500/10', text: 'text-lime-400', border: 'border-lime-500/30' },
  code_execution: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  delegation: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  other: { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/30' },
};

const CATEGORY_LABELS: Record<string, string> = {
  web: 'Web',
  browser: 'Browser',
  terminal: 'Terminal',
  file: 'File',
  vision: 'Vision',
  skills: 'Skills',
  moa: 'MOA',
  planning: 'Planning',
  memory: 'Memory',
  session: 'Session',
  cronjob: 'Cron',
  tts: 'TTS',
  rl: 'RL',
  messaging: 'Messaging',
  interaction: 'Interaction',
  code_execution: 'Code',
  delegation: 'Delegation',
  other: 'Other',
};

export const ToolsBrowser = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    try {
      const data = await api.getTools();
      setTools(data);
    } catch {
      addToast('error', 'Failed to load tools');
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(tools.map((t) => t.category))).sort();

  const filteredTools = tools.filter((tool) => {
    const matchesSearch = searchQuery
      ? tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesCategory = selectedCategory ? tool.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const groupedTools = filteredTools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, Tool[]>);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <div className="glass border-b border-[#c9956a]/10 p-3 md:p-4 flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools..."
              className="w-full gradient-border bg-[#0f0f16] text-zinc-200 rounded-xl pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#c9956a]/25 placeholder:text-zinc-600 transition-all"
            />
          </div>
        </div>

        {/* Category filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={clsx(
              'px-3.5 py-2 rounded-lg text-[13px] font-medium uppercase tracking-widest transition-all flex-shrink-0 border',
              selectedCategory === null
                ? 'glass bg-[#c9956a]/10 text-[#c9956a] border-[#c9956a]/40 ambient-glow'
                : 'glass text-zinc-500 border-[#c9956a]/10 hover:border-[#c9956a]/30'
            )}
          >
            All ({tools.length})
          </button>
          {categories.map((category) => {
            const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
            const count = tools.filter((t) => t.category === category).length;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={clsx(
                  'px-3.5 py-2 rounded-lg text-[13px] font-medium uppercase tracking-widest transition-all flex-shrink-0 border',
                  selectedCategory === category
                    ? `${colors.bg} ${colors.text} ${colors.border} ambient-glow`
                    : 'glass text-zinc-500 border-[#c9956a]/10 hover:border-[#c9956a]/30'
                )}
              >
                {CATEGORY_LABELS[category] || category} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Tools grid */}
      <div className="flex-1 overflow-y-auto px-3 py-3 md:px-5 md:py-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="text-[#c9956a] animate-spin" />
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="text-center text-zinc-500 py-8 text-[13px] font-outfit">
            {searchQuery ? 'No matching tools' : 'No tools available'}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTools)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([category, categoryTools]) => {
                const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
                return (
                  <div key={category} className="animate-fade-in">
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-[13px] font-semibold font-outfit text-gradient uppercase tracking-widest">
                        {CATEGORY_LABELS[category] || category}
                      </h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-[#c9956a]/30 to-transparent" />
                      <span className="text-[11px] text-zinc-600 font-outfit">
                        {categoryTools.length} {categoryTools.length === 1 ? 'tool' : 'tools'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {categoryTools.map((tool) => (
                        <div
                          key={tool.name}
                          className="gradient-border bg-[#0f0f16] rounded-xl p-3.5 card-hover ambient-glow transition-all"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-[13px] font-semibold text-zinc-100 font-mono">
                              {tool.name}
                            </h3>
                            <span
                              className={clsx(
                                'text-[9px] font-medium font-outfit px-1.5 py-0.5 rounded uppercase tracking-widest flex-shrink-0 border',
                                colors.bg,
                                colors.text,
                                colors.border,
                                ''
                              )}
                            >
                              {CATEGORY_LABELS[tool.category] || tool.category}
                            </span>
                          </div>

                          <p className="text-[12px] text-zinc-400 leading-relaxed font-outfit">
                            {tool.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};
