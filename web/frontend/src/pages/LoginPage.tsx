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
    <div className="min-h-[100dvh] bg-surface-0 noise flex flex-col items-center justify-center px-6 py-12 safe-top safe-bottom relative overflow-hidden">
      {/* Background atmosphere */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-brand/[0.03] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-30%] left-[-15%] w-[500px] h-[500px] rounded-full bg-brand/[0.02] blur-[120px] pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '80px 80px' }}
      />

      <div className="w-full max-w-[380px] relative z-10">
        {/* Branding */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand/20 to-brand/5 border border-brand/20 mb-6">
            <span className="text-xl font-bold text-brand font-mono tracking-tighter">H</span>
          </div>
          <h1 className="text-[28px] font-light text-zinc-100 tracking-tight">
            Hermes <span className="font-serif italic text-brand">Agent</span>
          </h1>
          <p className="text-[13px] text-zinc-500 mt-2 tracking-wide uppercase text-[11px]">Agent Management Console</p>
        </div>

        {/* Form */}
        <div className="animate-fade-in stagger-2">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-[11px] font-medium text-zinc-500 mb-2.5 uppercase tracking-widest">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-surface-2 text-zinc-100 rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:ring-1 focus:ring-brand/40 border border-border placeholder:text-zinc-600 transition-all"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-500/[0.06] border border-red-500/15 text-red-400 rounded-xl px-4 py-3 text-[13px] animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full flex items-center justify-center gap-2.5 bg-brand text-surface-0 rounded-xl py-3.5 text-[14px] font-semibold hover:bg-brand-light active:bg-brand-dark transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight size={15} strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-zinc-700 mt-10 animate-fade-in stagger-3">
          Hermes Agent &middot; Nous Research
        </p>
      </div>
    </div>
  );
};
