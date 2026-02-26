import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Skill } from '../../types';
import { useConfirmStore } from '../ConfirmDialog';
import { useToastStore } from '../../store/toast';
import { Plus, Search, Power, PowerOff, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import clsx from 'clsx';

export const SkillsManager = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: '',
    enabled: true,
  });
  const confirm = useConfirmStore((s) => s.open);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => { loadSkills(); }, []);

  const loadSkills = async () => {
    try {
      const data = await api.getSkills();
      setSkills(data);
    } catch {
      addToast('error', 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSkill(null);
    setFormData({ name: '', description: '', content: '', enabled: true });
    setShowModal(true);
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      description: skill.description,
      content: skill.content,
      enabled: skill.enabled,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingSkill) {
        await api.updateSkill(editingSkill.id, formData);
        addToast('success', 'Skill updated');
      } else {
        await api.createSkill(formData);
        addToast('success', 'Skill created');
      }
      await loadSkills();
      setShowModal(false);
    } catch {
      addToast('error', `Failed to ${editingSkill ? 'update' : 'create'} skill`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    confirm({
      title: 'Delete Skill',
      message: 'This skill will be permanently removed.',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        try {
          await api.deleteSkill(id);
          await loadSkills();
          addToast('success', 'Skill deleted');
        } catch {
          addToast('error', 'Failed to delete skill');
        }
      },
    });
  };

  const handleToggle = async (skill: Skill) => {
    try {
      await api.updateSkill(skill.id, { enabled: !skill.enabled });
      await loadSkills();
      addToast('info', `Skill ${skill.enabled ? 'disabled' : 'enabled'}`);
    } catch {
      addToast('error', 'Failed to toggle skill');
    }
  };

  const filteredSkills = skills.filter((skill) =>
    searchQuery
      ? skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="h-full flex flex-col bg-surface-0">
      {/* Header */}
      <div className="bg-surface-1 border-b border-border p-3 md:p-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills..."
              className="w-full bg-surface-2 text-zinc-200 rounded-xl pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand/40 border border-border placeholder:text-zinc-600"
            />
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-brand text-surface-0 rounded-xl text-[13px] font-semibold hover:bg-brand-light active:bg-brand-dark transition-colors flex-shrink-0"
          >
            <Plus size={15} strokeWidth={2} />
            <span className="hidden sm:inline">Create</span>
          </button>
        </div>
      </div>

      {/* Skills grid */}
      <div className="flex-1 overflow-y-auto px-3 py-3 md:px-5 md:py-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="text-brand animate-spin" />
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="text-center text-zinc-500 py-8 text-[13px]">
            {searchQuery ? 'No matching skills' : 'No skills yet'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-3">
            {filteredSkills.map((skill) => (
              <div
                key={skill.id}
                className={clsx(
                  'bg-surface-2 rounded-xl p-3.5 md:p-4 border transition-all',
                  skill.enabled
                    ? 'border-border hover:border-brand/30'
                    : 'border-border opacity-50'
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-[14px] font-semibold text-zinc-100 truncate flex-1 mr-2">{skill.name}</h3>
                  <button
                    onClick={() => handleToggle(skill)}
                    className={clsx(
                      'p-1.5 rounded-lg transition-colors flex-shrink-0',
                      skill.enabled
                        ? 'text-brand active:bg-brand/10'
                        : 'text-zinc-500 active:bg-surface-3'
                    )}
                  >
                    {skill.enabled ? <Power size={15} /> : <PowerOff size={15} />}
                  </button>
                </div>

                <p className="text-[12px] text-zinc-400 mb-3 line-clamp-2 leading-relaxed">
                  {skill.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className={clsx(
                    'text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-widest',
                    skill.enabled ? 'bg-brand/15 text-brand' : 'bg-zinc-500/15 text-zinc-500'
                  )}>
                    {skill.enabled ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(skill)}
                      className="p-1.5 bg-surface-3 text-zinc-400 rounded-lg active:bg-surface-4 transition-colors"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(skill.id)}
                      className="p-1.5 bg-red-500/10 text-red-400 rounded-lg active:bg-red-500/20 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal - full screen on mobile, centered on desktop */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50">
          <div className="bg-surface-1 w-full md:max-w-lg md:rounded-2xl rounded-t-2xl max-h-[90dvh] flex flex-col border-t md:border border-border">
            {/* Handle + header */}
            <div className="md:hidden flex items-center justify-center pt-2 pb-1">
              <div className="w-8 h-1 rounded-full bg-zinc-600" />
            </div>
            <div className="flex items-center justify-between px-4 py-3 md:px-5 md:py-4 border-b border-border">
              <h2 className="text-[16px] font-semibold text-zinc-100">
                {editingSkill ? 'Edit Skill' : 'Create Skill'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 -mr-2 text-zinc-400 active:bg-surface-2 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 md:px-5 space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-2 uppercase tracking-widest">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Web Search"
                  className="w-full bg-surface-2 text-zinc-100 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-brand/40 border border-border placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-2 uppercase tracking-widest">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description"
                  rows={2}
                  className="w-full bg-surface-2 text-zinc-100 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-brand/40 border border-border resize-none placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-2 uppercase tracking-widest">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Skill code or configuration"
                  rows={8}
                  className="w-full bg-surface-2 text-zinc-100 rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand/40 border border-border resize-none font-mono placeholder:text-zinc-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="rounded accent-brand"
                />
                <label htmlFor="enabled" className="text-[13px] text-zinc-300">
                  Enable this skill
                </label>
              </div>
            </div>

            <div className="px-4 py-3 md:px-5 md:py-4 border-t border-border flex gap-2 safe-bottom">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 md:flex-none px-4 py-2.5 bg-surface-3 text-zinc-300 rounded-xl text-[13px] font-medium active:bg-surface-4 border border-border"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name || !formData.content || saving}
                className="flex-1 md:flex-none px-5 py-2.5 bg-brand text-surface-0 rounded-xl text-[13px] font-semibold active:bg-brand-dark disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                <span>{editingSkill ? 'Update' : 'Create'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
