import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { LogEntry } from '../../types';
import { RefreshCw, Trash2, Search } from 'lucide-react';
import clsx from 'clsx';

const LOG_LEVELS = ['ALL', 'DEBUG', 'INFO', 'WARNING', 'ERROR'];

const getLevelColor = (level: string) => {
  switch (level.toLowerCase()) {
    case 'debug':
      return 'bg-slate-600 text-slate-200';
    case 'info':
      return 'bg-blue-600 text-blue-100';
    case 'warning':
      return 'bg-amber-600 text-amber-100';
    case 'error':
      return 'bg-red-600 text-red-100';
    default:
      return 'bg-slate-600 text-slate-200';
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

  const loadLogs = async () => {
    try {
      const params: any = { limit, offset };
      if (selectedLevel !== 'ALL') {
        params.level = selectedLevel;
      }

      const data = await api.getLogs(params);
      setLogs(data.logs);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [selectedLevel, offset]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadLogs();
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, selectedLevel, offset]);

  const handleClearLogs = async () => {
    if (confirm('Are you sure you want to clear all logs?')) {
      try {
        await api.clearLogs();
        setLogs([]);
        setTotal(0);
      } catch (error) {
        console.error('Failed to clear logs:', error);
      }
    }
  };

  const filteredLogs = logs.filter((log) =>
    searchQuery
      ? log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.logger.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="h-full flex flex-col bg-slate-950">
      <div className="bg-slate-900 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <select
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value);
                setOffset(0);
              }}
              className="bg-slate-800 text-slate-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {LOG_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>

            <div className="relative flex-1 max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="w-full bg-slate-800 text-slate-100 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh
            </label>

            <button
              onClick={loadLogs}
              disabled={loading}
              className="p-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={18} className={clsx(loading && 'animate-spin')} />
            </button>

            <button
              onClick={handleClearLogs}
              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center text-slate-400 py-8">Loading logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            No logs found
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-900 rounded-lg p-4 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={clsx(
                      'px-2 py-1 rounded text-xs font-semibold flex-shrink-0',
                      getLevelColor(log.level)
                    )}
                  >
                    {log.level}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-mono text-slate-400">
                        {log.logger}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-sm text-slate-200 break-words">
                      {log.message}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {total > limit && (
        <div className="bg-slate-900 border-t border-slate-700 p-4 flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Showing {offset + 1} - {Math.min(offset + limit, total)} of {total}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= total}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
