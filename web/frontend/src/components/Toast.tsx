import { useToastStore } from '../store/toast';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import clsx from 'clsx';

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const colorMap = {
  success: 'bg-surface-2 border-emerald-500/30 text-emerald-400',
  error: 'bg-surface-2 border-red-500/30 text-red-400',
  info: 'bg-surface-2 border-brand/30 text-brand',
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        return (
          <div
            key={toast.id}
            className={clsx(
              'pointer-events-auto flex items-start gap-2.5 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl shadow-black/30 animate-in slide-in-from-right',
              colorMap[toast.type]
            )}
          >
            <Icon size={16} className="flex-shrink-0 mt-0.5" />
            <span className="text-[13px] leading-relaxed flex-1 text-zinc-200">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 p-0.5 rounded hover:bg-white/10 transition-colors text-zinc-400"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
