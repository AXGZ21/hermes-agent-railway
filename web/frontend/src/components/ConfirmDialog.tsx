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
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={close}
        style={{ background: 'radial-gradient(circle at center, rgba(201, 149, 106, 0.08), transparent 60%), rgba(10, 10, 15, 0.9)' }}
      />
      <div className="relative gradient-border ambient-glow-strong glass-strong rounded-2xl shadow-2xl shadow-black/50 w-full max-w-sm overflow-hidden animate-fade-in-scale">
        <div className="flex items-center justify-between p-4 border-b border-[#c9956a]/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full gradient-border bg-[#16161f] flex items-center justify-center animate-glow-pulse">
              <AlertTriangle size={18} className="text-[#c9956a]" />
            </div>
            <h3 className="text-[15px] font-semibold font-outfit text-zinc-100">
              {title}
            </h3>
          </div>
          <button
            onClick={close}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-[#16161f] transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-4 py-4">
          <p className="text-[13px] text-zinc-400 leading-relaxed font-outfit">
            {message}
          </p>
        </div>
        <div className="flex gap-2 px-4 pb-4">
          <button
            onClick={close}
            className="flex-1 px-4 py-3 glass text-zinc-300 rounded-xl text-[14px] font-medium font-outfit hover:bg-[#16161f]/50 active:bg-[#16161f] active:scale-[0.98] border border-[#c9956a]/20 transition-all min-h-[48px]"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl text-[14px] font-semibold font-outfit hover:bg-red-600 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] active:bg-red-700 active:scale-95 transition-all min-h-[48px]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
