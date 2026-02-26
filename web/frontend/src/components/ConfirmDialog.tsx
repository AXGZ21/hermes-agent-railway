import { create } from 'zustand';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: (() => void) | null;
  open: (opts: { title: string; message: string; confirmLabel?: string; onConfirm: () => void }) => void;
  close: () => void;
}

export const useConfirmStore = create<ConfirmState>((set) => ({
  isOpen: false,
  title: '',
  message: '',
  confirmLabel: 'Delete',
  onConfirm: null,

  open: ({ title, message, confirmLabel = 'Delete', onConfirm }) => {
    set({ isOpen: true, title, message, confirmLabel, onConfirm });
  },

  close: () => {
    set({ isOpen: false, onConfirm: null });
  },
}));

export const ConfirmDialog = () => {
  const { isOpen, title, message, confirmLabel, onConfirm, close } = useConfirmStore();

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm?.();
    close();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
      <div className="relative bg-surface-1 rounded-2xl border border-white/[0.06] shadow-2xl shadow-black/30 w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center">
              <AlertTriangle size={16} className="text-red-400" />
            </div>
            <h3 className="text-[15px] font-semibold text-slate-100">{title}</h3>
          </div>
          <button onClick={close} className="p-1.5 rounded-lg text-slate-500 hover:bg-white/[0.06]">
            <X size={18} />
          </button>
        </div>
        <div className="px-4 py-4">
          <p className="text-[13px] text-slate-400 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-2 px-4 pb-4">
          <button
            onClick={close}
            className="flex-1 px-4 py-2.5 bg-surface-2 text-slate-300 rounded-xl text-[13px] font-medium hover:bg-white/[0.06] border border-white/[0.06] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-[13px] font-semibold hover:bg-red-600 active:bg-red-700 transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
