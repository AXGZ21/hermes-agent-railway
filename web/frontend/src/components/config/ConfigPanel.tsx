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
    <label className="block text-sm font-medium text-slate-300 mb-2">
      {label}
    </label>
    <div className="relative">
      <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
      <input
        type="password"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-800 text-slate-100 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 border border-slate-700 font-mono text-sm"
      />
    </div>
    <p className="text-xs text-slate-500 mt-1.5">{description}</p>
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
      setMessage({ type: 'success', text: 'Configuration saved successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save config:', error);
      setMessage({ type: 'error', text: 'Failed to save configuration' });
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (updates: Partial<Config>) => {
    if (config) {
      setConfig({ ...config, ...updates });
    }
  };

  const updateApiKey = (name: string, value: string) => {
    if (config) {
      setConfig({
        ...config,
        api_keys: { ...config.api_keys, [name]: value },
      });
    }
  };

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-violet-500" size={32} />
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof Globe }[] = [
    { id: 'llm', label: 'LLM Providers', icon: Globe },
    { id: 'telegram', label: 'Telegram', icon: Bot },
    { id: 'tools', label: 'Tool Keys', icon: Wrench },
    { id: 'advanced', label: 'Advanced', icon: Settings },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Tab bar */}
      <div className="bg-slate-900 border-b border-slate-700">
        <div className="flex gap-1 p-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm',
                  activeTab === tab.id
                    ? 'bg-violet-500 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                )}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">

          {/* LLM Providers Tab */}
          {activeTab === 'llm' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-slate-100">LLM Provider Configuration</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Configure your active LLM provider and enter API keys for all providers you want to use.
                </p>
              </div>

              {/* Active provider selector */}
              <div className="bg-slate-900 rounded-lg p-5 border border-slate-700 space-y-4">
                <h3 className="text-sm font-semibold text-violet-400 uppercase tracking-wider">Active Provider</h3>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Provider</label>
                  <select
                    value={config.provider}
                    onChange={(e) => updateConfig({ provider: e.target.value })}
                    className="w-full bg-slate-800 text-slate-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 border border-slate-700"
                  >
                    <option value="openrouter">OpenRouter</option>
                    <option value="nous">Nous Portal</option>
                    <option value="custom">Custom Endpoint</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Model</label>
                  <input
                    type="text"
                    value={config.model}
                    onChange={(e) => updateConfig({ model: e.target.value })}
                    placeholder="e.g., anthropic/claude-3.5-sonnet"
                    className="w-full bg-slate-800 text-slate-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 border border-slate-700"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {config.provider === 'openrouter'
                      ? 'Use OpenRouter format: provider/model (e.g., anthropic/claude-3.5-sonnet)'
                      : config.provider === 'nous'
                        ? 'Enter the Nous model name'
                        : 'Enter the model name for your endpoint'}
                  </p>
                </div>

                {config.provider === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Base URL</label>
                    <input
                      type="text"
                      value={config.base_url || ''}
                      onChange={(e) => updateConfig({ base_url: e.target.value })}
                      placeholder="https://api.example.com/v1"
                      className="w-full bg-slate-800 text-slate-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 border border-slate-700"
                    />
                  </div>
                )}
              </div>

              {/* API Keys section - always visible */}
              <div className="bg-slate-900 rounded-lg p-5 border border-slate-700 space-y-5">
                <h3 className="text-sm font-semibold text-violet-400 uppercase tracking-wider">API Keys</h3>
                <p className="text-xs text-slate-500 -mt-3">
                  Enter your API keys below. Keys are saved securely and only shown masked after saving.
                </p>

                <ApiKeyField
                  label="OpenRouter API Key"
                  value={config.api_keys?.openrouter || ''}
                  onChange={(v) => updateApiKey('openrouter', v)}
                  placeholder="sk-or-v1-..."
                  description="Get your key at openrouter.ai/keys -- provides access to 200+ models"
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
                  description="API key for your custom OpenAI-compatible endpoint (optional)"
                />
              </div>
            </div>
          )}

          {/* Telegram Tab */}
          {activeTab === 'telegram' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-100">Telegram Bot Configuration</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Connect a Telegram bot to interact with Hermes Agent from Telegram.
                </p>
              </div>

              <div className="bg-slate-900 rounded-lg p-5 border border-slate-700 space-y-5">
                <ApiKeyField
                  label="Telegram Bot Token"
                  value={config.api_keys?.telegram || ''}
                  onChange={(v) => updateApiKey('telegram', v)}
                  placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                  description="Get your bot token from @BotFather on Telegram"
                />

                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-200">Gateway Status</div>
                      <div className="text-sm text-slate-400 mt-1">
                        {config.telegram_enabled ? 'Running - bot is active' : 'Not configured - set token above'}
                      </div>
                    </div>
                    <div className={clsx(
                      'w-3 h-3 rounded-full',
                      config.telegram_enabled ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-slate-600'
                    )} />
                  </div>
                </div>

                <p className="text-xs text-slate-500">
                  Note: The Telegram gateway process will start automatically on the next container restart
                  after saving a valid bot token.
                </p>
              </div>
            </div>
          )}

          {/* Tool Keys Tab */}
          {activeTab === 'tools' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-100">Tool API Keys</h2>
                <p className="text-sm text-slate-400 mt-1">
                  API keys for Hermes Agent's built-in tools. These are optional -- tools that need keys will
                  be disabled if the key is not set.
                </p>
              </div>

              <div className="bg-slate-900 rounded-lg p-5 border border-slate-700 space-y-5">
                <ApiKeyField
                  label="Firecrawl API Key"
                  value={config.api_keys?.firecrawl || ''}
                  onChange={(v) => updateApiKey('firecrawl', v)}
                  placeholder="fc-..."
                  description="Web scraping and crawling -- get key at firecrawl.dev"
                />

                <ApiKeyField
                  label="FAL Key"
                  value={config.api_keys?.fal || ''}
                  onChange={(v) => updateApiKey('fal', v)}
                  placeholder="fal-..."
                  description="AI image generation -- get key at fal.ai"
                />

                <ApiKeyField
                  label="Browserbase API Key"
                  value={config.api_keys?.browserbase || ''}
                  onChange={(v) => updateApiKey('browserbase', v)}
                  placeholder="bb-..."
                  description="Browser automation -- get key at browserbase.com"
                />
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-100">Advanced Settings</h2>
              </div>

              <div className="bg-slate-900 rounded-lg p-5 border border-slate-700 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Log Level</label>
                  <select
                    value={config.log_level}
                    onChange={(e) => updateConfig({ log_level: e.target.value })}
                    className="w-full bg-slate-800 text-slate-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 border border-slate-700"
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

      {/* Save bar */}
      <div className="bg-slate-900 border-t border-slate-700 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {message ? (
            <div className="flex items-center gap-2 text-sm">
              {message.type === 'success' ? (
                <>
                  <CheckCircle size={18} className="text-emerald-500" />
                  <span className="text-emerald-500">{message.text}</span>
                </>
              ) : (
                <>
                  <XCircle size={18} className="text-red-500" />
                  <span className="text-red-500">{message.text}</span>
                </>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-500">Changes are applied immediately after saving</div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
