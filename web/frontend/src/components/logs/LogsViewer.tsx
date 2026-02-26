import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { LogEntry } from '../../types';
import { useConfirmStore } from '../ConfirmDialog';
import { useToastStore } from '../../store/toast';
import { RefreshCw, Trash2, Search } from 'lucide-react';
import clsx from 'clsx';

const LOG_LEVELS = ['ALL', 'DEBUG', 'INFO', 'WARNING', 'ERROR'];

const getLevelColor = (level: string) => {
  switch (level.toLowerCase()) {
    case 'debug': return 'bg-zinc-500/20 text-zinc-400';
    case 'info': return 'bg-emerald-500/20 text-emerald-400';
    case 'warning': return 'bg-amber-500/20 text-amber-400';
    case 'error': return 'bg-red-500/20 text-red-400';
    default: return 'bg-zinc-500/20 text-zinc-400';
  }
};

export const LogsViewer = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 100;
  const confirm = useConfirmStore((s) => s.open);
  const addToast = useToastStore((s) => s.addToast);

  const loadLogs = useCallback(async () => {
    try {
      const params: { limit: number; offset: number; level?: string } = { limit, offset };
      if (selectedLevel !== 'ALL') params.level = selectedLevel;
      const data = await api.getLogs(params);
      setLogs(data.logs);
      setTotal(data.total);
    } catch {
      addToast('error', 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  }, [selectedLevel, offset, addToast]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(loadLogs, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadLogs]);

  const handleClearLogs = () => {
    confirm({
      title: 'Clear Logs',
      message: 'All logs will be permanently deleted. This cannot be undone.',
      confirmLabel: 'Clear All',
      onConfirm: async () => {
        try {
          await api.clearLogs();
          setLogs([]);
          setTotal(0);
          addToast('success', 'Logs cleared');
        } catch {
          addToast('error', 'Failed to clear logs');
        }
      },
    });
  };

  const filteredLogs = logs.filter((log) =>
    searchQuery
      ? log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.logger.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="h-full flex flex-col bg-surface-0">
      {/* Toolbar */}
      <div className="bg-surface-1 border-b border-border p-3 md:p-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <select
            value={selectedLevel}
            onChange={(e) => { setSelectedLevel(e.target.value); setOffset(0); }}
            className="bg-surface-2 text-zinc-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand/40 border border-border"
          >
            {LOG_LEVELS.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>

          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs..."
              className="w-full bg-surface-2 text-zinc-200 rounded-xl pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand/40 border border-border placeholder:text-zinc-600"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <label className="hidden md:flex items-center gap-1.5 text-[12px] text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded accent-brand"
              />
              Auto
            </label>
            <button
              onClick={loadLogs}
              disabled={loading}
              className="p-2 bg-surface-2 text-zinc-400 rounded-xl active:bg-surface-3 border border-border"
            >
              <RefreshCw size={15} className={clsx(loading && 'animate-spin')} />
            </button>
            <button
              onClick={handleClearLogs}
              className="p-2 bg-red-500/15 text-red-400 rounded-xl active:bg-red-500/25 border border-red-500/10"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Logs list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 md:px-4 md:py-4">
        {loading ? (
          <div className="text-center text-zinc-500 py-8 text-[13px]">Loading logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center text-zinc-500 py-8 text-[13px]">No logs found</div>
        ) : (
          <div className="space-y-1.5">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="bg-surface-1 rounded-xl p-3 border border-border hover:border-border-active transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <span className={clsx(
                    'px-1.5 py-0.5 rounded-md text-[10px] font-semibold flex-shrink-0 mt-0.5 uppercase tracking-widest',
                    getLevelColor(log.level)
                  )}>
                    {log.level}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1">
                      <span className="text-[11px] font-mono text-zinc-500 truncate">{log.logger}</span>
                      <span className="text-[10px] text-zinc-600">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[13px] text-zinc-300 break-words leading-relaxed font-mono">
                      {log.message}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="bg-surface-1 border-t border-border px-4 py-2.5 flex items-center justify-between flex-shrink-0 safe-bottom">
          <div className="text-[11px] text-zinc-500">
            {offset + 1}-{Math.min(offset + limit, total)} of {total}
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              className="px-3 py-1.5 bg-surface-2 text-zinc-400 rounded-lg text-[12px] active:bg-surface-3 disabled:opacity-30 disabled:pointer-events-none border border-border"
            >
              Prev
            </button>
            <button
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= total}
              className="px-3 py-1.5 bg-surface-2 text-zinc-400 rounded-lg text-[12px] active:bg-surface-3 disabled:opacity-30 disabled:pointer-events-none border border-border"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
