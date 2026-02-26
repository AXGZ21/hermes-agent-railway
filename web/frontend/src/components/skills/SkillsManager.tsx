import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Skill } from '../../types';
import { Plus, Search, Power, PowerOff, Edit2, Trash2, X } from 'lucide-react';
import clsx from 'clsx';

export const SkillsManager = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: '',
    enabled: true,
  });

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const data = await api.getSkills();
      setSkills(data);
    } catch (error) {
      console.error('Failed to load skills:', error);
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
    try {
      if (editingSkill) {
        await api.updateSkill(editingSkill.id, formData);
      } else {
        await api.createSkill(formData);
      }
      await loadSkills();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save skill:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this skill?')) {
      try {
        await api.deleteSkill(id);
        await loadSkills();
      } catch (error) {
        console.error('Failed to delete skill:', error);
      }
    }
  };

  const handleToggle = async (skill: Skill) => {
    try {
      await api.updateSkill(skill.id, { enabled: !skill.enabled });
      await loadSkills();
    } catch (error) {
      console.error('Failed to toggle skill:', error);
    }
  };

  const filteredSkills = skills.filter((skill) =>
    searchQuery
      ? skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="h-full flex flex-col bg-slate-950">
      <div className="bg-slate-900 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills..."
              className="w-full bg-slate-800 text-slate-100 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
          >
            <Plus size={18} />
            <span>Create Skill</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="text-center text-slate-400 py-8">Loading skills...</div>
        ) : filteredSkills.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            {searchQuery ? 'No skills found matching your search' : 'No skills yet'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSkills.map((skill) => (
              <div
                key={skill.id}
                className={clsx(
                  'bg-slate-900 rounded-lg p-5 border-2 transition-all hover:border-violet-500',
                  skill.enabled ? 'border-slate-700' : 'border-slate-800 opacity-60'
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-100">{skill.name}</h3>
                  <button
                    onClick={() => handleToggle(skill)}
                    className={clsx(
                      'p-1 rounded transition-colors',
                      skill.enabled
                        ? 'text-emerald-500 hover:bg-emerald-500/10'
                        : 'text-slate-500 hover:bg-slate-800'
                    )}
                  >
                    {skill.enabled ? <Power size={18} /> : <PowerOff size={18} />}
                  </button>
                </div>

                <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                  {skill.description}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                  <span>{new Date(skill.created_at).toLocaleDateString()}</span>
                  <span className={skill.enabled ? 'text-emerald-500' : 'text-slate-500'}>
                    {skill.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(skill)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition-colors"
                  >
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(skill.id)}
                    className="flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-100">
                {editingSkill ? 'Edit Skill' : 'Create Skill'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Web Search"
                  className="w-full bg-slate-800 text-slate-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of what this skill does"
                  rows={2}
                  className="w-full bg-slate-800 text-slate-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Content (Code/Configuration)
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Skill implementation code or configuration"
                  rows={12}
                  className="w-full bg-slate-800 text-slate-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none font-mono text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="enabled" className="text-sm text-slate-300">
                  Enable this skill
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700 p-4 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name || !formData.content}
                className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingSkill ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
