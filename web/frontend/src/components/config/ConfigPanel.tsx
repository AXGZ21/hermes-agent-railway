import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Config } from '../../types';
import { Save, CheckCircle, XCircle, Loader2, Key, Globe, Bot, Wrench, Settings } from 'lucide-react';
import clsx from 'clsx';

type Tab = 'llm' | 'telegram' | 'tools' | 'advanced';

interface ApiKeyFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  description: string;
}

const ApiKeyField = ({ label, value, onChange, placeholder, description }: ApiKeyFieldProps) => (
  <div>
    <label className="block text-[13px] font-medium text-slate-300 mb-2">{label}</label>
    <div className="relative">
      <Key size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
      <input
        type="password"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface-2 text-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-violet-500/40 border border-white/[0.06] font-mono placeholder:text-slate-600"
      />
    </div>
    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">{description}</p>
  </div>
);

export const ConfigPanel = () => {
  const [activeTab, setActiveTab] = useState<Tab>('llm');
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await api.getConfig();
      setConfig(data);
    } catch (error) {
      console.error('Failed to load config:', error);
      setMessage({ type: 'error', text: 'Failed to load configuration' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setMessage(null);
    try {
      const updated = await api.updateConfig(config);
      setConfig(updated);
      setMessage({ type: 'success', text: 'Saved' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save config:', error);
      setMessage({ type: 'error', text: 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (updates: Partial<Config>) => {
    if (config) setConfig({ ...config, ...updates });
  };

  const updateApiKey = (name: string, value: string) => {
    if (config) {
      setConfig({ ...config, api_keys: { ...config.api_keys, [name]: value } });
    }
  };

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-violet-500" size={28} />
      </div>
    );
  }

  const tabs: { id: Tab; label: string; mobileLabel: string; icon: typeof Globe }[] = [
    { id: 'llm', label: 'LLM Providers', mobileLabel: 'LLM', icon: Globe },
    { id: 'telegram', label: 'Telegram', mobileLabel: 'Telegram', icon: Bot },
    { id: 'tools', label: 'Tool Keys', mobileLabel: 'Tools', icon: Wrench },
    { id: 'advanced', label: 'Advanced', mobileLabel: 'Advanced', icon: Settings },
  ];

  return (
    <div className="h-full flex flex-col bg-surface-0">
      {/* Tab bar - scrollable on mobile */}
      <div className="bg-surface-1 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex gap-1 p-2 md:p-3 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-xl font-medium transition-all text-[13px] whitespace-nowrap flex-shrink-0',
                  activeTab === tab.id
                    ? 'bg-violet-500/15 text-violet-400'
                    : 'text-slate-500 active:bg-white/[0.04]'
                )}
              >
                <Icon size={15} strokeWidth={1.8} />
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden">{tab.mobileLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-6">
        <div className="max-w-xl mx-auto">

          {/* LLM Tab */}
          {activeTab === 'llm' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[17px] font-semibold text-slate-100">LLM Providers</h2>
                <p className="text-[12px] text-slate-500 mt-1">
                  Configure your active provider and API keys.
                </p>
              </div>

              <div className="bg-surface-1 rounded-2xl p-4 md:p-5 border border-white/[0.06] space-y-4">
                <h3 className="text-[11px] font-semibold text-violet-400 uppercase tracking-wider">Active Provider</h3>

                <div>
                  <label className="block text-[13px] font-medium text-slate-300 mb-2">Provider</label>
                  <select
                    value={config.provider}
                    onChange={(e) => updateConfig({ provider: e.target.value })}
                    className="w-full bg-surface-2 text-slate-100 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-violet-500/40 border border-white/[0.06]"
                  >
                    <option value="openrouter">OpenRouter</option>
                    <option value="nous">Nous Portal</option>
                    <option value="custom">Custom Endpoint</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-slate-300 mb-2">Model</label>
                  <input
                    type="text"
                    value={config.model}
                    onChange={(e) => updateConfig({ model: e.target.value })}
                    placeholder="e.g., anthropic/claude-3.5-sonnet"
                    className="w-full bg-surface-2 text-slate-100 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-violet-500/40 border border-white/[0.06] placeholder:text-slate-600"
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    {config.provider === 'openrouter'
                      ? 'OpenRouter format: provider/model'
                      : config.provider === 'nous'
                        ? 'Enter the Nous model name'
                        : 'Model name for your endpoint'}
                  </p>
                </div>

                {config.provider === 'custom' && (
                  <div>
                    <label className="block text-[13px] font-medium text-slate-300 mb-2">Base URL</label>
                    <input
                      type="text"
                      value={config.base_url || ''}
                      onChange={(e) => updateConfig({ base_url: e.target.value })}
                      placeholder="https://api.example.com/v1"
                      className="w-full bg-surface-2 text-slate-100 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-violet-500/40 border border-white/[0.06] placeholder:text-slate-600"
                    />
                  </div>
                )}
              </div>

              <div className="bg-surface-1 rounded-2xl p-4 md:p-5 border border-white/[0.06] space-y-4">
                <h3 className="text-[11px] font-semibold text-violet-400 uppercase tracking-wider">API Keys</h3>
                <p className="text-[11px] text-slate-500 -mt-2">Keys are saved securely and shown masked after saving.</p>

                <ApiKeyField
                  label="OpenRouter API Key"
                  value={config.api_keys?.openrouter || ''}
                  onChange={(v) => updateApiKey('openrouter', v)}
                  placeholder="sk-or-v1-..."
                  description="Get your key at openrouter.ai/keys"
                />
                <ApiKeyField
                  label="Nous Portal API Key"
                  value={config.api_keys?.nous || ''}
                  onChange={(v) => updateApiKey('nous', v)}
                  placeholder="nous-..."
                  description="Get your key at portal.nousresearch.com"
                />
                <ApiKeyField
                  label="Custom Endpoint API Key"
                  value={config.api_keys?.custom || ''}
                  onChange={(v) => updateApiKey('custom', v)}
                  placeholder="sk-..."
                  description="API key for your custom endpoint (optional)"
                />
              </div>
            </div>
          )}

          {/* Telegram Tab */}
          {activeTab === 'telegram' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[17px] font-semibold text-slate-100">Telegram Bot</h2>
                <p className="text-[12px] text-slate-500 mt-1">
                  Connect a Telegram bot to interact with Hermes Agent.
                </p>
              </div>

              <div className="bg-surface-1 rounded-2xl p-4 md:p-5 border border-white/[0.06] space-y-4">
                <ApiKeyField
                  label="Bot Token"
                  value={config.api_keys?.telegram || ''}
                  onChange={(v) => updateApiKey('telegram', v)}
                  placeholder="123456789:ABCdefGHI..."
                  description="Get your bot token from @BotFather on Telegram"
                />

                <div className="bg-surface-2 rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-medium text-slate-200">Gateway Status</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {config.telegram_enabled ? 'Bot is active' : 'Set token above to enable'}
                    </div>
                  </div>
                  <div className={clsx(
                    'w-2.5 h-2.5 rounded-full',
                    config.telegram_enabled ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-slate-600'
                  )} />
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  The Telegram gateway starts automatically on the next container restart after saving a valid token.
                </p>
              </div>
            </div>
          )}

          {/* Tools Tab */}
          {activeTab === 'tools' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[17px] font-semibold text-slate-100">Tool API Keys</h2>
                <p className="text-[12px] text-slate-500 mt-1">
                  Optional keys for built-in agent tools.
                </p>
              </div>

              <div className="bg-surface-1 rounded-2xl p-4 md:p-5 border border-white/[0.06] space-y-4">
                <ApiKeyField
                  label="Firecrawl API Key"
                  value={config.api_keys?.firecrawl || ''}
                  onChange={(v) => updateApiKey('firecrawl', v)}
                  placeholder="fc-..."
                  description="Web scraping and crawling - firecrawl.dev"
                />
                <ApiKeyField
                  label="FAL Key"
                  value={config.api_keys?.fal || ''}
                  onChange={(v) => updateApiKey('fal', v)}
                  placeholder="fal-..."
                  description="AI image generation - fal.ai"
                />
                <ApiKeyField
                  label="Browserbase API Key"
                  value={config.api_keys?.browserbase || ''}
                  onChange={(v) => updateApiKey('browserbase', v)}
                  placeholder="bb-..."
                  description="Browser automation - browserbase.com"
                />
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[17px] font-semibold text-slate-100">Advanced</h2>
              </div>

              <div className="bg-surface-1 rounded-2xl p-4 md:p-5 border border-white/[0.06] space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-slate-300 mb-2">Log Level</label>
                  <select
                    value={config.log_level}
                    onChange={(e) => updateConfig({ log_level: e.target.value })}
                    className="w-full bg-surface-2 text-slate-100 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-violet-500/40 border border-white/[0.06]"
                  >
                    <option value="DEBUG">DEBUG</option>
                    <option value="INFO">INFO</option>
                    <option value="WARNING">WARNING</option>
                    <option value="ERROR">ERROR</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save bar - sticky bottom */}
      <div className="bg-surface-1 border-t border-white/[0.06] px-4 py-3 flex-shrink-0 safe-bottom">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            {message ? (
              <div className="flex items-center gap-1.5 text-[12px]">
                {message.type === 'success' ? (
                  <>
                    <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                    <span className="text-emerald-500 truncate">{message.text}</span>
                  </>
                ) : (
                  <>
                    <XCircle size={14} className="text-red-500 flex-shrink-0" />
                    <span className="text-red-500 truncate">{message.text}</span>
                  </>
                )}
              </div>
            ) : (
              <div className="text-[11px] text-slate-600 hidden md:block">Changes applied after saving</div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-500 text-white rounded-xl text-[13px] font-semibold hover:bg-violet-600 active:bg-violet-700 transition-colors disabled:opacity-40 disabled:pointer-events-none flex-shrink-0"
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
