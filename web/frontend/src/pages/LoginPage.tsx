import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { Lock, ArrowRight, Loader2 } from 'lucide-react';

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
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-surface-0 flex flex-col items-center justify-center px-6 py-12 safe-top safe-bottom">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-violet-500/[0.06] rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 shadow-lg shadow-violet-500/20 mb-5">
            <span className="text-2xl font-black text-white font-mono">H</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Hermes Agent</h1>
          <p className="text-sm text-slate-500 mt-1.5">AI Agent Management Dashboard</p>
        </div>

        {/* Login card */}
        <div className="bg-surface-1 rounded-2xl border border-white/[0.06] p-6 shadow-2xl shadow-black/20">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-[13px] font-medium text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  strokeWidth={1.8}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-surface-2 text-slate-100 rounded-xl pl-10 pr-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-violet-500/50 border border-white/[0.06] placeholder:text-slate-600"
                  required
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/8 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-[13px]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full flex items-center justify-center gap-2 bg-violet-500 text-white rounded-xl py-3 text-[15px] font-semibold hover:bg-violet-600 active:bg-violet-700 transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight size={16} strokeWidth={2} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-slate-600 mt-6">
          Hermes Agent by Nous Research
        </p>
      </div>
    </div>
  );
};
