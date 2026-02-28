import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CronJob } from '../../types';
import { useConfirmStore } from '../ConfirmDialog';
import { useToastStore } from '../../store/toast';
import { Plus, Trash2, Clock, Calendar, Loader2, X } from 'lucide-react';
import clsx from 'clsx';

export const CronManager = () => {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    schedule: '',
    command: '',
    enabled: true,
  });
  const confirm = useConfirmStore((s) => s.open);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await api.getCronJobs();
      setJobs(data);
    } catch {
      addToast('error', 'Failed to load cron jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({ name: '', schedule: '', command: '', enabled: true });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.createCronJob(formData);
      await loadJobs();
      setShowModal(false);
      addToast('success', 'Cron job created');
    } catch {
      addToast('error', 'Failed to create cron job');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    confirm({
      title: 'Delete Cron Job',
      message: `"${name}" will be permanently removed.`,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        try {
          await api.deleteCronJob(id);
          await loadJobs();
          addToast('success', 'Cron job deleted');
        } catch {
          addToast('error', 'Failed to delete cron job');
        }
      },
    });
  };

  const formatSchedule = (schedule: string): string => {
    // Convert cron expression to human-readable format
    // This is a simple implementation - could be enhanced with a library
    const parts = schedule.trim().split(/\s+/);
    if (parts.length < 5) return schedule;

    const [minute, hour, day, month, weekday] = parts;

    if (schedule === '* * * * *') return 'Every minute';
    if (schedule === '0 * * * *') return 'Every hour';
    if (schedule === '0 0 * * *') return 'Daily at midnight';
    if (schedule === '0 9 * * *') return 'Daily at 9:00 AM';
    if (schedule === '0 0 * * 0') return 'Weekly on Sunday';
    if (schedule === '0 0 1 * *') return 'Monthly on the 1st';

    return schedule;
  };

  const formatDateTime = (dateStr: string | undefined): string => {
    if (!dateStr) return 'Never';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <div className="glass border-b border-[#c9956a]/10 p-3 md:p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="hidden md:block">
            <h1 className="text-[15px] font-semibold font-outfit text-gradient">
              Cron Jobs
            </h1>
            <p className="text-[12px] text-zinc-500 mt-0.5">
              <span className="font-outfit font-medium">Scheduled</span> task automation
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-brand text-[#0a0a0f] rounded-xl text-[13px] font-semibold font-outfit active:scale-95 transition-all md:ml-auto"
          >
            <Plus size={15} strokeWidth={2} />
            <span>Create</span>
          </button>
        </div>
      </div>

      {/* Jobs list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 md:px-5 md:py-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="text-[#c9956a] animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full gradient-border bg-[#16161f] flex items-center justify-center mb-4 animate-float">
              <Clock size={32} className="text-[#c9956a]" />
            </div>
            <p className="text-[15px] font-semibold font-outfit text-gradient mb-1">
              No cron jobs scheduled
            </p>
            <p className="text-[12px] text-zinc-600 font-outfit">
              Create a job to automate tasks on a schedule
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-w-5xl">
            {jobs.map((job) => (
              <div
                key={job.id}
                className={clsx(
                  'gradient-border bg-[#0f0f16] rounded-xl p-4 transition-all card-hover animate-fade-in',
                  job.enabled
                    ? 'ambient-glow'
                    : 'opacity-50'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-[14px] font-semibold font-outfit text-zinc-100">
                        {job.name}
                      </h3>
                      <span
                        className={clsx(
                          "text-[10px] font-medium font-outfit px-2 py-0.5 rounded-full uppercase tracking-widest flex-shrink-0",
                          job.enabled
                            ? 'bg-gradient-brand text-[#0a0a0f]'
                            : 'glass text-zinc-500 border border-[#c9956a]/20'
                        )}
                      >
                        {job.enabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[12px] mb-3">
                      <div className="flex items-center gap-2 text-zinc-400 font-outfit">
                        <Clock size={13} className="flex-shrink-0 text-[#c9956a]" />
                        <span className="font-medium text-[#c9956a]">
                          {formatSchedule(job.schedule)}
                        </span>
                        <span className="text-zinc-600">•</span>
                        <code className="text-[11px] text-zinc-500 font-mono">
                          {job.schedule}
                        </code>
                      </div>

                      <div className="gradient-border bg-[#1e1e28] rounded-lg p-2.5 font-mono">
                        <div className="flex items-start gap-2 text-zinc-400">
                          <span className="text-[#c9956a] flex-shrink-0">$</span>
                          <code className="text-[11px] text-zinc-300 break-all">
                            {job.command}
                          </code>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-zinc-600 font-outfit">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={11} />
                        <span>Last: {formatDateTime(job.last_run)}</span>
                      </div>
                      {job.next_run && (
                        <>
                          <span className="text-zinc-700">•</span>
                          <div className="flex items-center gap-1.5">
                            <Clock size={11} />
                            <span>Next: {formatDateTime(job.next_run)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(job.id, job.name)}
                    className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 active:bg-red-500/30 transition-all flex-shrink-0 border border-red-500/30"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 glass-strong flex items-end md:items-center justify-center z-50 animate-fade-in">
          <div className="gradient-border ambient-glow-strong bg-[#0f0f16] w-full md:max-w-lg md:rounded-2xl rounded-t-2xl max-h-[90dvh] flex flex-col">
            {/* Handle + header */}
            <div className="md:hidden flex items-center justify-center pt-2 pb-1">
              <div className="w-8 h-1 rounded-full bg-zinc-600" />
            </div>
            <div className="flex items-center justify-between px-4 py-3 md:px-5 md:py-4 border-b border-[#c9956a]/10">
              <h2 className="text-[16px] font-semibold font-outfit text-gradient">
                Create Cron Job
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 -mr-2 text-zinc-400 hover:text-zinc-300 active:bg-[#16161f] rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 md:px-5 space-y-4">
              <div>
                <label className="block text-[11px] font-medium font-outfit text-zinc-400 mb-2 uppercase tracking-widest">
                  Job Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Daily Backup"
                  className="w-full gradient-border bg-[#16161f] text-zinc-100 rounded-xl px-4 py-2.5 text-[14px] font-outfit focus:outline-none focus:ring-2 focus:ring-[#c9956a]/40 placeholder:text-zinc-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium font-outfit text-zinc-400 mb-2 uppercase tracking-widest">
                  Schedule (Cron Expression)
                </label>
                <input
                  type="text"
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  placeholder="e.g., 0 9 * * * (daily at 9am)"
                  className="w-full gradient-border bg-[#16161f] text-zinc-100 rounded-xl px-4 py-2.5 text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[#c9956a]/40 placeholder:text-zinc-600 transition-all"
                />
                <p className="text-[10px] text-zinc-600 mt-1.5 font-outfit">
                  Format: minute hour day month weekday
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-medium font-outfit text-zinc-400 mb-2 uppercase tracking-widest">
                  Command
                </label>
                <textarea
                  value={formData.command}
                  onChange={(e) => setFormData({ ...formData, command: e.target.value })}
                  placeholder="Command to execute"
                  rows={4}
                  className="w-full gradient-border bg-[#16161f] text-zinc-100 rounded-xl px-4 py-2.5 text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[#c9956a]/40 resize-none placeholder:text-zinc-600 scrollbar-hide transition-all"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="rounded accent-[#c9956a]"
                />
                <label htmlFor="enabled" className="text-[13px] text-zinc-300 font-outfit">
                  Enable this job immediately
                </label>
              </div>
            </div>

            <div className="px-4 py-3 md:px-5 md:py-4 border-t border-[#c9956a]/10 flex gap-2 safe-bottom">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 md:flex-none px-4 py-2.5 glass text-zinc-300 rounded-xl text-[13px] font-medium font-outfit hover:bg-[#16161f]/50 active:bg-[#16161f] border border-[#c9956a]/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name || !formData.schedule || !formData.command || saving}
                className="flex-1 md:flex-none px-5 py-2.5 bg-gradient-brand text-[#0a0a0f] rounded-xl text-[13px] font-semibold font-outfit active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 transition-all"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                <span>Create</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
