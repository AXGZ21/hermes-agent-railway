import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Config } from '../../types';
import { Save, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import clsx from 'clsx';

type Tab = 'llm' | 'telegram' | 'tools' | 'advanced';

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
      await api.updateConfig(config);
      setMessage({ type: 'success', text: 'Configuration saved successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save config:', error);
      setMessage({ type: 'error', text: 'Failed to save configuration' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      const result = await api.testConnection();
      setMessage({
        type: result.success ? 'success' : 'error',
        text: result.message
      });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Connection test failed' });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const updateConfig = (updates: Partial<Config>) => {
    if (config) {
      setConfig({ ...config, ...updates });
    }
  };

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-violet-500" size={32} />
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'llm', label: 'LLM Provider' },
    { id: 'telegram', label: 'Telegram' },
    { id: 'tools', label: 'Tools' },
    { id: 'advanced', label: 'Advanced' },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-950">
      <div className="bg-slate-900 border-b border-slate-700">
        <div className="flex gap-1 p-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-violet-500 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          {activeTab === 'llm' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-100">LLM Provider Configuration</h2>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Provider
                </label>
                <select
                  value={config.provider}
                  onChange={(e) => updateConfig({ provider: e.target.value })}
                  className="w-full bg-slate-800 text-slate-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="openrouter">OpenRouter</option>
                  <option value="nous">Nous Portal</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Model
                </label>
                <input
                  type="text"
                  value={config.model}
                  onChange={(e) => updateConfig({ model: e.target.value })}
                  placeholder="e.g., anthropic/claude-3-opus"
                  className="w-full bg-slate-800 text-slate-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {config.provider === 'openrouter' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    OpenRouter API Key
                  </label>
                  <input
                    type="password"
                    value={config.openrouter_api_key}
                    onChange={(e) => updateConfig({ openrouter_api_key: e.target.value })}
                    placeholder="sk-or-..."
                    className="w-full bg-slate-800 text-slate-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                  />
                </div>
              )}

              {config.provider === 'nous' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nous API Key
                  </label>
                  <input
                    type="password"
                    value={config.nous_api_key}
                    onChange={(e) => updateConfig({ nous_api_key: e.target.value })}
                    placeholder="nous-..."
                    className="w-full bg-slate-800 text-slate-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                  />
                </div>
              )}

              {config.provider === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Base URL
                  </label>
                  <input
                    type="text"
                    value={config.base_url}
                    onChange={(e) => updateConfig({ base_url: e.target.value })}
                    placeholder="https://api.example.com/v1"
                    className="w-full bg-slate-800 text-slate-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              )}

              <button
                onClick={handleTestConnection}
                className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Test Connection
              </button>
            </div>
          )}

          {activeTab === 'telegram' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-100">Telegram Bot Configuration</h2>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Bot Token
                </label>
                <input
                  type="password"
                  value={config.telegram_bot_token}
                  onChange={(e) => updateConfig({ telegram_bot_token: e.target.value })}
                  placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                  className="w-full bg-slate-800 text-slate-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                />
                <p className="text-sm text-slate-400 mt-2">
                  Get your bot token from @BotFather on Telegram
                </p>
              </div>

              <div className="bg-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-200">Bot Status</div>
                    <div className="text-sm text-slate-400 mt-1">
                      {config.telegram_bot_token ? 'Configured' : 'Not configured'}
                    </div>
                  </div>
                  <div
                    className={clsx(
                      'w-3 h-3 rounded-full',
                      config.telegram_bot_token ? 'bg-emerald-500' : 'bg-slate-600'
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-100">Tool API Keys</h2>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Firecrawl API Key
                </label>
                <input
                  type="password"
                  value={config.firecrawl_api_key}
                  onChange={(e) => updateConfig({ firecrawl_api_key: e.target.value })}
                  placeholder="fc-..."
                  className="w-full bg-slate-800 text-slate-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                />
                <p className="text-sm text-slate-400 mt-2">
                  For web scraping and crawling capabilities
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  FAL Key
                </label>
                <input
                  type="password"
                  value={config.fal_key}
                  onChange={(e) => updateConfig({ fal_key: e.target.value })}
                  placeholder="fal-..."
                  className="w-full bg-slate-800 text-slate-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                />
                <p className="text-sm text-slate-400 mt-2">
                  For AI image generation
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Browserbase API Key
                </label>
                <input
                  type="password"
                  value={config.browserbase_api_key}
                  onChange={(e) => updateConfig({ browserbase_api_key: e.target.value })}
                  placeholder="bb-..."
                  className="w-full bg-slate-800 text-slate-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                />
                <p className="text-sm text-slate-400 mt-2">
                  For browser automation
                </p>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-100">Advanced Settings</h2>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Log Level
                </label>
                <select
                  value={config.log_level}
                  onChange={(e) => updateConfig({ log_level: e.target.value })}
                  className="w-full bg-slate-800 text-slate-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="DEBUG">DEBUG</option>
                  <option value="INFO">INFO</option>
                  <option value="WARNING">WARNING</option>
                  <option value="ERROR">ERROR</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-900 border-t border-slate-700 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {message && (
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
          )}

          {!message && <div />}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
