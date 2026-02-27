import { useToastStore } from '../store/toast';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import clsx from 'clsx';

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const accentMap = {
  success: 'border-l-emerald-500/80 bg-emerald-500/[0.03]',
  error: 'border-l-red-500/80 bg-red-500/[0.03]',
  info: 'border-l-[#c9956a]/80 bg-[#c9956a]/[0.03]',
};

const iconColorMap = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  info: 'text-[#c9956a]',
};

const glowMap = {
  success: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
  error: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
  info: 'shadow-[0_0_20px_rgba(201,149,106,0.15)]',
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:bottom-auto md:left-auto md:top-6 md:right-6 z-[100] flex flex-col-reverse md:flex-col gap-3 md:max-w-sm w-full md:w-auto pointer-events-none">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        return (
          <div
            key={toast.id}
            className={clsx(
              'pointer-events-auto glass gradient-border rounded-2xl overflow-hidden animate-slide-in',
              glowMap[toast.type]
            )}
          >
            <div className={clsx(
              'flex items-start gap-3 px-4 py-4 border-l-2',
              accentMap[toast.type]
            )}>
              <Icon
                size={18}
                className={clsx('flex-shrink-0 mt-0.5', iconColorMap[toast.type])}
                strokeWidth={2}
              />
              <span className="text-[14px] leading-relaxed flex-1 text-zinc-200 font-outfit font-medium">
                {toast.message}
              </span>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 p-2 -mr-1 rounded-lg hover:bg-white/10 active:bg-white/15 transition-all text-zinc-500 hover:text-zinc-300"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
