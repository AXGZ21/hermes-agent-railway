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
    <div className="absolute inset-0 bg-[#0a0a0f] flex flex-col px-7 md:px-12 safe-top safe-bottom overflow-hidden">
      {/* Atmospheric warmth */}
      <div
        className="absolute top-[5%] right-[-10%] w-[70vw] h-[70vw] max-w-[450px] max-h-[450px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201, 149, 106, 0.14) 0%, transparent 65%)' }}
      />
      <div
        className="absolute bottom-[-5%] left-[-10%] w-[60vw] h-[60vw] max-w-[350px] max-h-[350px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201, 149, 106, 0.07) 0%, transparent 65%)' }}
      />

      {/* Vertically position content at ~38% from top for premium composition */}
      <div className="flex-1 flex items-center">
        <div className="w-full max-w-[400px] md:ml-[12%] relative z-10 -mt-[8vh]">

          {/* Section 1: Brand mark + headline */}
          <div className="mb-12 md:mb-16 animate-fade-in">
            <div className="w-11 h-11 rounded-xl bg-gradient-brand flex items-center justify-center mb-6">
              <span className="text-base font-bold text-[#0a0a0f] font-outfit tracking-tighter">H</span>
            </div>

            <h1 className="text-[40px] md:text-[56px] font-outfit tracking-[-0.04em] leading-[0.9] text-zinc-100 font-light">
              Hermes
            </h1>
            <p className="text-[15px] md:text-lg font-outfit text-zinc-500 mt-3 tracking-wide font-light">
              Command Center
            </p>
          </div>

          {/* Section 2: Login card */}
          <div className="animate-fade-in stagger-2">
            <div
              className="bg-[#111119] border border-white/[0.08] rounded-2xl p-7 md:p-9"
              style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 24px -4px rgba(0,0,0,0.5)' }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-[11px] font-semibold text-zinc-500 mb-3 uppercase tracking-[0.2em] font-outfit"
                  >
                    Access Key
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-[#0a0a0f] text-zinc-100 rounded-xl px-5 py-4 text-[15px] font-outfit focus:outline-none focus:ring-2 focus:ring-[#c9956a]/25 border border-white/[0.06] placeholder:text-zinc-600 transition-all"
                    required
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="bg-red-500/[0.06] border border-red-500/15 text-red-400 rounded-xl px-4 py-3 text-[13px] font-outfit font-medium animate-fade-in flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !password}
                  className="w-full flex items-center justify-center gap-2.5 bg-gradient-brand text-[#0a0a0f] rounded-xl py-4 text-[14px] font-bold font-outfit tracking-wide active:scale-[0.98] transition-transform duration-150 disabled:opacity-30 disabled:pointer-events-none"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight size={16} strokeWidth={2.5} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Section 3: Footer */}
          <div className="mt-12 animate-fade-in stagger-3">
            <div className="w-8 h-px bg-[#c9956a]/20 mb-4" />
            <p className="text-[11px] text-zinc-600 font-outfit tracking-wider">
              Nous Research
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
