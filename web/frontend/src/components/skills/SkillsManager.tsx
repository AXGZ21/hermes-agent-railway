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
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <div className="glass border-b border-[#272733] p-3 md:p-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills..."
              className="w-full gradient-border bg-[#16161f] text-zinc-200 rounded-xl pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand/60 focus:shadow-[0_0_20px_rgba(201,149,106,0.15)] placeholder:text-zinc-600 font-outfit transition-all"
            />
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-brand text-[#0a0a0f] rounded-xl text-[13px] font-semibold active:scale-95 transition-all flex-shrink-0 font-outfit"
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
          <div className="text-center text-zinc-500 py-8 text-[13px] font-outfit">
            {searchQuery ? 'No matching skills' : 'No skills yet'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-3">
            {filteredSkills.map((skill) => (
              <div
                key={skill.id}
                className={clsx(
                  'gradient-border ambient-glow bg-[#0f0f16] rounded-xl p-3.5 md:p-4 card-hover transition-all',
                  skill.enabled ? '' : 'opacity-50'
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-[14px] font-semibold text-zinc-100 truncate flex-1 mr-2 font-outfit">{skill.name}</h3>
                  <button
                    onClick={() => handleToggle(skill)}
                    className={clsx(
                      'p-2 rounded-lg transition-all flex-shrink-0',
                      skill.enabled
                        ? 'text-brand hover:bg-brand/10'
                        : 'text-zinc-500 hover:bg-[#16161f]'
                    )}
                  >
                    {skill.enabled ? <Power size={15} /> : <PowerOff size={15} />}
                  </button>
                </div>

                <p className="text-[12px] text-zinc-400 mb-3 line-clamp-2 leading-relaxed font-outfit">
                  {skill.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className={clsx(
                    'text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-widest font-outfit',
                    skill.enabled
                      ? 'bg-gradient-brand text-[#0a0a0f]'
                      : 'bg-zinc-500/20 text-zinc-500'
                  )}>
                    {skill.enabled ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(skill)}
                      className="p-1.5 glass text-zinc-400 rounded-lg hover:text-brand transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(skill.id)}
                      className="p-1.5 glass bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
                    >
                      <Trash2 size={14} />
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
        <div className="fixed inset-0 bg-black/90 md:bg-black/70 flex items-end md:items-center justify-center z-50 animate-fade-in">
          <div className="glass-strong ambient-glow-strong gradient-border bg-[#0f0f16] w-full md:max-w-lg md:rounded-2xl rounded-t-2xl max-h-[90dvh] flex flex-col animate-slide-up md:animate-fade-in-scale">
            {/* Handle + header */}
            <div className="md:hidden flex items-center justify-center pt-2 pb-1">
              <div className="w-8 h-1 rounded-full bg-zinc-600" />
            </div>
            <div className="flex items-center justify-between px-4 py-3 md:px-5 md:py-4 border-b border-[#272733]">
              <h2 className="text-[16px] font-semibold text-zinc-100 font-outfit">
                {editingSkill ? 'Edit Skill' : 'Create Skill'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 -mr-2 text-zinc-400 hover:text-zinc-200 active:bg-[#16161f] rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 md:px-5 space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-2 uppercase tracking-widest font-outfit">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Web Search"
                  className="w-full bg-[#16161f] text-zinc-100 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-brand/60 border border-[#272733] placeholder:text-zinc-600 font-outfit transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-2 uppercase tracking-widest font-outfit">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description"
                  rows={2}
                  className="w-full bg-[#16161f] text-zinc-100 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-brand/60 border border-[#272733] resize-none placeholder:text-zinc-600 font-outfit transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-2 uppercase tracking-widest font-outfit">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Skill code or configuration"
                  rows={8}
                  className="w-full bg-[#16161f] text-zinc-100 rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand/60 border border-[#272733] resize-none font-mono placeholder:text-zinc-600 transition-all"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="rounded accent-brand focus:ring-2 focus:ring-brand/60"
                />
                <label htmlFor="enabled" className="text-[13px] text-zinc-300 font-outfit">
                  Enable this skill
                </label>
              </div>
            </div>

            <div className="px-4 py-3 md:px-5 md:py-4 border-t border-[#272733] flex gap-2 safe-bottom">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 md:flex-none px-4 py-2.5 glass text-zinc-300 rounded-xl text-[13px] font-medium hover:text-zinc-100 active:scale-95 border border-[#272733] font-outfit transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name || !formData.content || saving}
                className="flex-1 md:flex-none px-5 py-2.5 bg-gradient-brand text-[#0a0a0f] rounded-xl text-[13px] font-semibold active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 font-outfit transition-all"
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
