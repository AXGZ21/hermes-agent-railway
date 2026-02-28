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
    <label className="block text-[11px] font-medium text-zinc-400 mb-2 uppercase tracking-widest font-outfit">{label}</label>
    <div className="relative">
      <Key size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand/60" />
      <input
        type="password"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#16161f] text-zinc-100 rounded-xl pl-10 pr-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-brand/60 border border-[#272733] font-mono placeholder:text-zinc-600 transition-all"
      />
    </div>
    <p className="text-[11px] text-zinc-500 mt-1.5 leading-relaxed font-outfit">{description}</p>
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
        <Loader2 className="animate-spin text-brand" size={28} />
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
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      {/* Tab bar - scrollable on mobile */}
      <div className="glass border-b border-[#272733] flex-shrink-0">
        <div className="flex gap-1.5 p-2.5 md:p-3 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 md:px-4 py-2.5 rounded-lg font-medium transition-all text-[13px] whitespace-nowrap flex-shrink-0 relative font-outfit',
                  activeTab === tab.id
                    ? 'text-brand'
                    : 'text-zinc-500 hover:text-zinc-300 active:bg-[#16161f]'
                )}
              >
                <Icon size={15} strokeWidth={1.8} />
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden">{tab.mobileLabel}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand to-transparent shadow-[0_0_12px_rgba(201,149,106,0.6)]" />
                )}
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
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-[17px] font-semibold text-zinc-100 font-outfit">LLM Providers</h2>
                <p className="text-[12px] text-zinc-500 mt-1 font-outfit">
                  Configure your active provider and API keys.
                </p>
              </div>

              <div className="gradient-border ambient-glow bg-[#0f0f16] rounded-2xl p-4 md:p-5 space-y-4">
                <h3 className="text-[11px] font-semibold text-gradient uppercase tracking-widest font-outfit">Active Provider</h3>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-2 uppercase tracking-widest font-outfit">Provider</label>
                  <select
                    value={config.provider}
                    onChange={(e) => updateConfig({ provider: e.target.value })}
                    className="w-full bg-[#16161f] text-zinc-100 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-brand/60 border border-[#272733] font-outfit transition-all"
                  >
                    <option value="openrouter">OpenRouter</option>
                    <option value="nous">Nous Portal</option>
                    <option value="custom">Custom Endpoint</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-2 uppercase tracking-widest font-outfit">Model</label>
                  <input
                    type="text"
                    value={config.model}
                    onChange={(e) => updateConfig({ model: e.target.value })}
                    placeholder="e.g., anthropic/claude-3.5-sonnet"
                    className="w-full bg-[#16161f] text-zinc-100 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-brand/60 border border-[#272733] placeholder:text-zinc-600 font-outfit transition-all"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1.5 font-outfit">
                    {config.provider === 'openrouter'
                      ? 'OpenRouter format: provider/model'
                      : config.provider === 'nous'
                        ? 'Enter the Nous model name'
                        : 'Model name for your endpoint'}
                  </p>
                </div>

                {config.provider === 'custom' && (
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-2 uppercase tracking-widest font-outfit">Base URL</label>
                    <input
                      type="text"
                      value={config.base_url || ''}
                      onChange={(e) => updateConfig({ base_url: e.target.value })}
                      placeholder="https://api.example.com/v1"
                      className="w-full bg-[#16161f] text-zinc-100 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-brand/60 border border-[#272733] placeholder:text-zinc-600 font-outfit transition-all"
                    />
                  </div>
                )}
              </div>

              <div className="gradient-border ambient-glow bg-[#0f0f16] rounded-2xl p-4 md:p-5 space-y-4">
                <h3 className="text-[11px] font-semibold text-gradient uppercase tracking-widest font-outfit">API Keys</h3>
                <p className="text-[11px] text-zinc-500 -mt-2 font-outfit">Keys are saved securely and shown masked after saving.</p>

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
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-[17px] font-semibold text-zinc-100 font-outfit">Telegram Bot</h2>
                <p className="text-[12px] text-zinc-500 mt-1 font-outfit">
                  Connect a Telegram bot to interact with Hermes Agent.
                </p>
              </div>

              <div className="gradient-border ambient-glow bg-[#0f0f16] rounded-2xl p-4 md:p-5 space-y-4">
                <ApiKeyField
                  label="Bot Token"
                  value={config.api_keys?.telegram || ''}
                  onChange={(v) => updateApiKey('telegram', v)}
                  placeholder="123456789:ABCdefGHI..."
                  description="Get your bot token from @BotFather on Telegram"
                />

                <div className="bg-[#16161f] rounded-xl p-3.5 flex items-center justify-between border border-[#272733]">
                  <div>
                    <div className="text-[13px] font-medium text-zinc-200 font-outfit">Gateway Status</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5 font-outfit">
                      {config.telegram_enabled ? 'Bot is active' : 'Set token above to enable'}
                    </div>
                  </div>
                  <div className={clsx(
                    'w-2.5 h-2.5 rounded-full',
                    config.telegram_enabled ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-zinc-600'
                  )} />
                </div>

                <p className="text-[11px] text-zinc-500 leading-relaxed font-outfit">
                  The Telegram gateway starts automatically on the next container restart after saving a valid token.
                </p>
              </div>
            </div>
          )}

          {/* Tools Tab */}
          {activeTab === 'tools' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-[17px] font-semibold text-zinc-100 font-outfit">Tool API Keys</h2>
                <p className="text-[12px] text-zinc-500 mt-1 font-outfit">
                  Optional keys for built-in agent tools.
                </p>
              </div>

              <div className="gradient-border ambient-glow bg-[#0f0f16] rounded-2xl p-4 md:p-5 space-y-4">
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
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-[17px] font-semibold text-zinc-100 font-outfit">Advanced</h2>
              </div>

              <div className="gradient-border ambient-glow bg-[#0f0f16] rounded-2xl p-4 md:p-5 space-y-4">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-2 uppercase tracking-widest font-outfit">Log Level</label>
                  <select
                    value={config.log_level}
                    onChange={(e) => updateConfig({ log_level: e.target.value })}
                    className="w-full bg-[#16161f] text-zinc-100 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-brand/60 border border-[#272733] font-outfit transition-all"
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
      <div className="glass-strong border-t border-[#272733] px-4 py-3 flex-shrink-0 safe-bottom">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            {message ? (
              <div className="flex items-center gap-1.5 text-[12px] font-outfit">
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
              <div className="text-[11px] text-zinc-600 hidden md:block font-outfit">Changes applied after saving</div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-brand text-[#0a0a0f] rounded-xl text-[13px] font-semibold active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none flex-shrink-0 font-outfit"
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
