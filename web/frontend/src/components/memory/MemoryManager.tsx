import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { MemoryFile } from '../../types';
import { useToastStore } from '../../store/toast';
import { FileText, Save, X, Loader2 } from 'lucide-react';
import clsx from 'clsx';

export const MemoryManager = () => {
  const [files, setFiles] = useState<MemoryFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<MemoryFile | null>(null);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const data = await api.getMemoryFiles();
      setFiles(data);
    } catch {
      addToast('error', 'Failed to load memory files');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFile = (file: MemoryFile) => {
    setSelectedFile(file);
    setEditContent(file.content);
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    setSaving(true);
    try {
      await api.updateMemoryFile(selectedFile.filename, editContent);
      await loadFiles();
      setSelectedFile(null);
      addToast('success', 'Memory file saved');
    } catch {
      addToast('error', 'Failed to save memory file');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setEditContent('');
  };

  const getFileIcon = (filename: string) => {
    if (filename === 'SOUL.md') return '🧠';
    if (filename === 'MEMORY.md') return '📝';
    if (filename === 'USER.md') return '👤';
    return '📄';
  };

  return (
    <div className="h-full flex flex-col bg-surface-0">
      {/* Header */}
      <div className="bg-surface-1 border-b border-border p-3 md:p-4 flex-shrink-0">
        <h1 className="text-[15px] font-semibold text-zinc-100">Memory Files</h1>
        <p className="text-[12px] text-zinc-500 mt-0.5">
          <span className="font-serif italic">Persistent</span> knowledge across sessions
        </p>
      </div>

      {/* Files grid */}
      <div className="flex-1 overflow-y-auto px-3 py-3 md:px-5 md:py-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="text-brand animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-3 max-w-5xl">
            {files.map((file) => (
              <button
                key={file.filename}
                onClick={() => handleSelectFile(file)}
                className="bg-surface-2 rounded-xl p-4 md:p-5 border border-border hover:border-brand/30 transition-all text-left group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl flex-shrink-0">{getFileIcon(file.filename)}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold text-zinc-100 mb-1">
                      <span className="font-serif italic">{file.name}</span>
                    </h3>
                    <p className="text-[12px] text-zinc-400 leading-relaxed">
                      {file.description}
                    </p>
                  </div>
                </div>

                <div className="bg-surface-3 rounded-lg p-3 mb-3 max-h-24 overflow-hidden relative">
                  {file.content ? (
                    <p className="text-[11px] text-zinc-500 font-mono line-clamp-3 leading-relaxed">
                      {file.content}
                    </p>
                  ) : (
                    <p className="text-[11px] text-zinc-600 italic">Empty file</p>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-surface-3 to-transparent" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-600 uppercase tracking-widest">
                    {file.updated_at
                      ? new Date(file.updated_at * 1000).toLocaleDateString()
                      : 'Never modified'}
                  </span>
                  <FileText
                    size={14}
                    className="text-zinc-600 group-hover:text-brand transition-colors"
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Editor modal - full screen */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-0 md:p-4">
          <div className="bg-surface-1 w-full h-full md:h-auto md:max-w-4xl md:max-h-[90vh] md:rounded-2xl flex flex-col border-t md:border border-border">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 md:px-5 md:py-4 border-b border-border flex-shrink-0">
              <div>
                <h2 className="text-[16px] font-semibold text-zinc-100">
                  <span className="font-serif italic">{selectedFile.name}</span>
                </h2>
                <p className="text-[12px] text-zinc-500 mt-0.5">
                  {selectedFile.description}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 -mr-2 text-zinc-400 active:bg-surface-2 rounded-xl flex-shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-hidden p-4 md:p-5">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder={`Write your ${selectedFile.name.toLowerCase()} here...`}
                className="w-full h-full bg-surface-2 text-zinc-100 rounded-xl px-4 py-3 text-[13px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand/40 border border-border resize-none font-mono placeholder:text-zinc-600"
              />
            </div>

            {/* Footer */}
            <div className="px-4 py-3 md:px-5 md:py-4 border-t border-border flex gap-2 safe-bottom flex-shrink-0">
              <button
                onClick={handleClose}
                className="flex-1 md:flex-none px-4 py-2.5 bg-surface-3 text-zinc-300 rounded-xl text-[13px] font-medium active:bg-surface-4 border border-border"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 md:flex-none px-5 py-2.5 bg-brand text-surface-0 rounded-xl text-[13px] font-semibold active:bg-brand-dark disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
