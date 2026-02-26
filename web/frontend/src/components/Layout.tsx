import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, History, Puzzle, Settings, FileText, LogOut, Menu, X, Brain, Wrench, Clock, Radio } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useState, useEffect } from 'react';
import clsx from 'clsx';

const navItems = [
  { to: '/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/sessions', icon: History, label: 'Sessions' },
  { to: '/memory', icon: Brain, label: 'Memory' },
  { to: '/tools', icon: Wrench, label: 'Tools' },
  { to: '/skills', icon: Puzzle, label: 'Skills' },
  { to: '/cron', icon: Clock, label: 'Cron' },
  { to: '/gateway', icon: Radio, label: 'Gateway' },
  { to: '/config', icon: Settings, label: 'Config' },
  { to: '/logs', icon: FileText, label: 'Logs' },
];

export const Layout = () => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentPage = navItems.find((item) => location.pathname.startsWith(item.to));

  return (
    <div className="flex h-[100dvh] bg-surface-0">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-[220px] bg-surface-1 border-r border-border flex-col flex-shrink-0">
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-brand/20 flex items-center justify-center">
              <span className="text-brand font-bold text-lg">H</span>
            </div>
            <h1 className="text-sm font-medium tracking-widest text-zinc-100 uppercase">HERMES</h1>
          </div>
          <p className="text-[11px] text-zinc-500 ml-10">
            <span className="font-serif italic">Agent</span> Console
          </p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-[13px] font-medium relative',
                  isActive
                    ? 'text-brand bg-brand-muted border-l-2 border-brand'
                    : 'text-zinc-400 hover:bg-surface-2 hover:text-zinc-200 border-l-2 border-transparent'
                )
              }
            >
              <item.icon size={18} strokeWidth={1.8} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 mt-auto border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-zinc-500 hover:bg-surface-2 hover:text-zinc-300 transition-all text-[13px]"
          >
            <LogOut size={18} strokeWidth={1.8} />
            <span>Logout</span>
          </button>
          <div className="px-3 pt-3 text-[10px] text-zinc-600 uppercase tracking-widest">
            Version 1.0
          </div>
        </div>
      </aside>

      {/* ── Mobile drawer backdrop ── */}
      <div
        className={clsx(
          'md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setDrawerOpen(false)}
      />

      {/* ── Mobile drawer ── */}
      <div
        className={clsx(
          'md:hidden fixed inset-y-0 left-0 z-50 w-[270px] bg-surface-1 border-r border-border flex flex-col',
          'transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 safe-top">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-brand/20 flex items-center justify-center">
                <span className="text-brand font-bold text-lg">H</span>
              </div>
              <h1 className="text-sm font-medium tracking-widest text-zinc-100 uppercase">HERMES</h1>
            </div>
            <p className="text-[11px] text-zinc-500 ml-10">
              <span className="font-serif italic">Agent</span> Console
            </p>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-2.5 -mr-2 rounded-xl text-zinc-400 active:bg-surface-2"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 mt-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all text-[15px] font-medium relative',
                  isActive
                    ? 'text-brand bg-brand-muted border-l-2 border-brand'
                    : 'text-zinc-400 active:bg-surface-2 border-l-2 border-transparent'
                )
              }
            >
              <item.icon size={22} strokeWidth={1.8} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border safe-bottom">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3.5 rounded-lg text-zinc-500 active:bg-surface-2 text-[15px]"
          >
            <LogOut size={22} strokeWidth={1.8} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 h-12 bg-surface-1/80 backdrop-blur-xl border-b border-border flex-shrink-0 safe-top">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 -ml-2 rounded-xl text-zinc-400 active:bg-surface-2"
          >
            <Menu size={22} strokeWidth={1.8} />
          </button>

          <span className="text-[13px] font-semibold text-zinc-100 tracking-wide uppercase tracking-widest">
            {currentPage?.label || 'Dashboard'}
          </span>

          <div className="w-[38px]" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>

        {/* ── Mobile bottom tab bar ── */}
        <nav className="md:hidden flex items-stretch bg-surface-1/90 backdrop-blur-xl border-t border-border safe-bottom flex-shrink-0">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex-1 flex flex-col items-center gap-1 pt-2.5 pb-2 relative"
              >
                <item.icon
                  size={20}
                  strokeWidth={isActive ? 2 : 1.5}
                  className={clsx(
                    'transition-colors',
                    isActive ? 'text-brand' : 'text-zinc-500'
                  )}
                />
                <span className={clsx(
                  'text-[10px] font-medium leading-none transition-colors uppercase tracking-widest',
                  isActive ? 'text-brand' : 'text-zinc-600'
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
