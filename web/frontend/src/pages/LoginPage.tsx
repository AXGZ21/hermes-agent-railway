import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { ArrowRight, Loader2 } from 'lucide-react';

export const LoginPage = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(password);
      if (success) {
        navigate('/chat');
      } else {
        setError('Invalid password');
      }
    } catch {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-[#0a0a0f] flex flex-col items-center justify-center px-5 py-8 md:px-6 md:py-12 safe-top safe-bottom overflow-hidden">
      {/* Background atmospheric orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[80vw] h-[80vw] max-w-[500px] max-h-[500px] rounded-full bg-[#c9956a]/[0.08] blur-[100px] pointer-events-none animate-float"
        style={{ animationDuration: '8s' }}
      />
      <div className="absolute top-[20%] right-[10%] w-[70vw] h-[70vw] max-w-[400px] max-h-[400px] rounded-full bg-[#e0796b]/[0.06] blur-[80px] pointer-events-none animate-float"
        style={{ animationDuration: '10s', animationDelay: '1s' }}
      />
      <div className="absolute bottom-[-20%] left-[-10%] w-[90vw] h-[90vw] max-w-[600px] max-h-[600px] rounded-full bg-[#c9956a]/[0.05] blur-[100px] pointer-events-none animate-float"
        style={{ animationDuration: '12s', animationDelay: '2s' }}
      />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none grid-pattern" />

      <div className="w-full max-w-[420px] relative z-10">
        {/* Branding */}
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-brand gradient-border mb-6 md:mb-8 animate-glow-pulse">
            <span className="text-2xl md:text-3xl font-bold text-[#0a0a0f] font-outfit tracking-tighter">H</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-light text-zinc-100 tracking-tight font-outfit mb-2">
            <span className="text-gradient">Hermes</span>{' '}
            <span className="font-serif italic text-[#e0796b]">Agent</span>
          </h1>
          <p className="text-xs text-zinc-500 tracking-[0.2em] uppercase font-outfit font-medium">
            Command Center
          </p>
        </div>

        {/* Form */}
        <div className="animate-fade-in stagger-2">
          <div className="glass-strong gradient-border rounded-2xl p-6 md:p-8 ambient-glow-strong">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="password"
                  className="block text-[11px] font-semibold text-zinc-400 mb-3 uppercase tracking-[0.15em] font-outfit"
                >
                  Access Key
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#0f0f16] text-zinc-100 rounded-xl px-5 py-4 text-[15px] font-outfit focus:outline-none focus:ring-2 focus:ring-[#c9956a]/40 border border-white/5 placeholder:text-zinc-600 transition-all shadow-inner"
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-500/[0.08] border border-red-500/20 text-red-400 rounded-xl px-4 py-3.5 text-[13px] font-outfit font-medium animate-fade-in flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-red-400 animate-pulse" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !password}
                className="w-full flex items-center justify-center gap-3 bg-gradient-brand text-[#0a0a0f] rounded-xl py-3.5 text-[15px] font-bold font-outfit tracking-wide uppercase hover:shadow-[0_0_30px_rgba(201,149,106,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <span>Access Console</span>
                    <ArrowRight size={18} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="text-center mt-8 animate-fade-in stagger-3">
          <p className="text-[11px] text-zinc-700 font-outfit tracking-wider">
            Hermes Agent &middot; Nous Research
          </p>
          <div className="mt-3 flex items-center justify-center gap-1">
            <div className="w-1 h-1 rounded-full bg-[#c9956a]/40" />
            <div className="w-1 h-1 rounded-full bg-[#c9956a]/60" />
            <div className="w-1 h-1 rounded-full bg-[#c9956a]/40" />
          </div>
        </div>
      </div>
    </div>
  );
};
