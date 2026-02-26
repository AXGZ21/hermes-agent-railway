import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { GatewayPlatform } from '../../types';
import { useToastStore } from '../../store/toast';
import { Loader2, CheckCircle2, AlertCircle, Circle } from 'lucide-react';
import clsx from 'clsx';

const PLATFORM_ICONS: Record<string, string> = {
  telegram: '✈️',
  discord: '💬',
  slack: '💼',
  whatsapp: '📱',
};

const PLATFORM_ENV_VARS: Record<string, string> = {
  telegram: 'TELEGRAM_BOT_TOKEN',
  discord: 'DISCORD_BOT_TOKEN',
  slack: 'SLACK_BOT_TOKEN',
  whatsapp: 'WHATSAPP_API_KEY',
};

const PLATFORM_SETUP_INSTRUCTIONS: Record<string, string[]> = {
  telegram: [
    'Create a bot with @BotFather on Telegram',
    'Copy the bot token',
    'Set TELEGRAM_BOT_TOKEN in your environment',
    'Restart the Hermes gateway service',
  ],
  discord: [
    'Create an application at discord.com/developers',
    'Create a bot and copy the token',
    'Set DISCORD_BOT_TOKEN in your environment',
    'Invite the bot to your server',
    'Restart the Hermes gateway service',
  ],
  slack: [
    'Create a Slack app at api.slack.com/apps',
    'Add bot token scopes and install to workspace',
    'Copy the bot token',
    'Set SLACK_BOT_TOKEN in your environment',
    'Restart the Hermes gateway service',
  ],
  whatsapp: [
    'Set up WhatsApp Business API access',
    'Get your API key from the provider',
    'Set WHATSAPP_API_KEY in your environment',
    'Restart the Hermes gateway service',
  ],
};

export const GatewayStatus = () => {
  const [platforms, setPlatforms] = useState<GatewayPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<GatewayPlatform | null>(null);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const data = await api.getGatewayStatus();
      setPlatforms(data.platforms);
    } catch {
      addToast('error', 'Failed to load gateway status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (platform: GatewayPlatform) => {
    if (platform.connected) {
      return <CheckCircle2 size={20} className="text-green-400 animate-glow-pulse" />;
    } else if (platform.configured) {
      return <AlertCircle size={20} className="text-[#c9956a] animate-glow-pulse" />;
    } else {
      return <Circle size={20} className="text-zinc-600" />;
    }
  };

  const getStatusText = (platform: GatewayPlatform) => {
    if (platform.connected) {
      return { text: 'Connected', color: 'text-green-400' };
    } else if (platform.configured) {
      return { text: 'Configured', color: 'text-[#c9956a]' };
    } else {
      return { text: 'Not configured', color: 'text-zinc-500' };
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <div className="glass border-b border-[#c9956a]/10 p-3 md:p-4 flex-shrink-0">
        <h1 className="text-[15px] font-semibold font-outfit text-gradient">
          Gateway Status
        </h1>
        <p className="text-[12px] text-zinc-500 mt-0.5">
          <span className="font-serif italic">Multi-platform</span> messaging connections
        </p>
      </div>

      {/* Platforms grid */}
      <div className="flex-1 overflow-y-auto px-3 py-3 md:px-5 md:py-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="text-[#c9956a] animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-3 max-w-5xl">
            {platforms.map((platform) => {
              const status = getStatusText(platform);
              return (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform)}
                  className="gradient-border bg-[#0f0f16] rounded-xl p-4 md:p-5 text-left group card-hover ambient-glow animate-fade-in transition-all"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full gradient-border bg-[#16161f] flex items-center justify-center flex-shrink-0">
                      <div className="text-2xl">
                        {PLATFORM_ICONS[platform.icon] || '🔌'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-semibold font-outfit text-zinc-100 mb-1">
                        {platform.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(platform)}
                        <span className={clsx("text-[12px] font-medium font-outfit", status.color)}>
                          {status.text}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-outfit">
                      <span className="text-zinc-500">Configured</span>
                      <span className={platform.configured ? 'text-green-400' : 'text-zinc-600'}>
                        {platform.configured ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="h-px bg-[#c9956a]/10" />
                    <div className="flex items-center justify-between text-[11px] font-outfit">
                      <span className="text-zinc-500">Connected</span>
                      <span className={platform.connected ? 'text-green-400' : 'text-zinc-600'}>
                        {platform.connected ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>

                  {!platform.configured && (
                    <div className="mt-3 pt-3 border-t border-[#c9956a]/10">
                      <span className="text-[11px] text-gradient font-outfit group-hover:text-[#e0796b] transition-colors">
                        View setup instructions →
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Info box */}
        <div className="mt-6 gradient-border bg-[#0f0f16] rounded-xl p-4 max-w-5xl ambient-glow">
          <h3 className="text-[13px] font-semibold font-outfit text-gradient mb-2">
            About Gateway
          </h3>
          <p className="text-[12px] text-zinc-400 leading-relaxed font-outfit">
            The Hermes Gateway allows the agent to communicate across multiple messaging platforms
            simultaneously. Configure your platform credentials to enable cross-platform messaging
            and notifications.
          </p>
        </div>
      </div>

      {/* Setup instructions modal */}
      {selectedPlatform && (
        <div className="fixed inset-0 glass-strong backdrop-blur-xl flex items-end md:items-center justify-center z-50 animate-fade-in">
          <div className="gradient-border ambient-glow-strong bg-[#0f0f16] w-full md:max-w-lg md:rounded-2xl rounded-t-2xl max-h-[90dvh] flex flex-col">
            {/* Handle + header */}
            <div className="md:hidden flex items-center justify-center pt-2 pb-1">
              <div className="w-8 h-1 rounded-full bg-zinc-600" />
            </div>
            <div className="flex items-center justify-between px-4 py-3 md:px-5 md:py-4 border-b border-[#c9956a]/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-border bg-[#16161f] flex items-center justify-center">
                  <span className="text-xl">
                    {PLATFORM_ICONS[selectedPlatform.icon] || '🔌'}
                  </span>
                </div>
                <div>
                  <h2 className="text-[16px] font-semibold font-outfit text-zinc-100">
                    {selectedPlatform.name}
                  </h2>
                  <p className="text-[11px] text-zinc-500 font-outfit">
                    {getStatusText(selectedPlatform).text}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlatform(null)}
                className="p-2 -mr-2 text-zinc-400 hover:text-zinc-300 active:bg-[#16161f] rounded-xl transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 md:px-5 space-y-4">
              {/* Status */}
              <div className="gradient-border bg-[#16161f] rounded-xl p-4 ambient-glow">
                <h3 className="text-[12px] font-semibold font-outfit text-zinc-300 mb-3 uppercase tracking-widest">
                  Current Status
                </h3>
                <div className="space-y-2 text-[13px] font-outfit">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Configured</span>
                    <span
                      className={
                        selectedPlatform.configured ? 'text-green-400' : 'text-zinc-600'
                      }
                    >
                      {selectedPlatform.configured ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="h-px bg-[#c9956a]/10" />
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Connected</span>
                    <span
                      className={
                        selectedPlatform.connected ? 'text-green-400' : 'text-zinc-600'
                      }
                    >
                      {selectedPlatform.connected ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="h-px bg-[#c9956a]/10" />
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Environment Variable</span>
                    <code className="text-[11px] text-[#c9956a] font-mono">
                      {PLATFORM_ENV_VARS[selectedPlatform.id] || 'N/A'}
                    </code>
                  </div>
                </div>
              </div>

              {/* Setup instructions */}
              {!selectedPlatform.configured && (
                <div className="gradient-border bg-[#16161f] rounded-xl p-4 ambient-glow">
                  <h3 className="text-[12px] font-semibold font-outfit text-zinc-300 mb-3 uppercase tracking-widest">
                    Setup Instructions
                  </h3>
                  <ol className="space-y-2 text-[13px] text-zinc-400 leading-relaxed list-decimal list-inside font-outfit">
                    {PLATFORM_SETUP_INSTRUCTIONS[selectedPlatform.id]?.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            <div className="px-4 py-3 md:px-5 md:py-4 border-t border-[#c9956a]/10 safe-bottom">
              <button
                onClick={() => setSelectedPlatform(null)}
                className="w-full px-4 py-2.5 glass text-zinc-300 rounded-xl text-[13px] font-medium font-outfit hover:bg-[#16161f]/50 active:bg-[#16161f] border border-[#c9956a]/20 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
