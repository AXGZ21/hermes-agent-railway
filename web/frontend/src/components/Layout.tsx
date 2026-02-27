import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, History, Puzzle, Settings, FileText, LogOut, Menu, X, Brain, Wrench, Clock, Radio, MoreHorizontal } from 'lucide-react';
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
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

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

  // Close more menu on route change
  useEffect(() => {
    setMoreMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentPage = navItems.find((item) => location.pathname.startsWith(item.to));

  // Primary mobile tabs (first 4 items + more)
  const primaryMobileItems = [
    navItems[0], // Chat
    navItems[1], // Sessions
    navItems[2], // Memory
    navItems[7], // Config
  ];

  // Overflow items for "More" menu
  const overflowMobileItems = navItems.filter(
    item => !primaryMobileItems.includes(item)
  );

  return (
    <div className="flex h-[100dvh] bg-[#0a0a0f] noise">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-16 glass border-r border-white/5 flex-col flex-shrink-0 relative">
        {/* Subtle gradient at top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9956a]/30 to-transparent" />

        {/* Logo */}
        <div className="flex items-center justify-center pt-6 pb-8">
          <div className="w-10 h-10 rounded-xl gradient-border bg-gradient-brand flex items-center justify-center animate-glow-pulse group">
            <span className="text-[#0a0a0f] font-bold text-xl font-outfit tracking-tighter">H</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col items-center gap-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={clsx(
                  'relative group w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300',
                  isActive
                    ? 'text-[#c9956a]'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#c9956a] rounded-full ambient-glow" />
                )}

                <item.icon
                  size={20}
                  strokeWidth={isActive ? 2 : 1.5}
                  className={isActive ? 'drop-shadow-[0_0_8px_rgba(201,149,106,0.5)]' : ''}
                />

                {/* Tooltip */}
                <div className="absolute left-full ml-3 px-3 py-1.5 rounded-lg glass-strong border border-white/10 text-xs font-medium text-zinc-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                  {item.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#16161f]" />
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout button at bottom */}
        <div className="p-2 pb-6 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="relative group w-12 h-12 rounded-xl flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-white/5 transition-all duration-300"
          >
            <LogOut size={20} strokeWidth={1.5} />

            {/* Tooltip */}
            <div className="absolute left-full ml-3 px-3 py-1.5 rounded-lg glass-strong border border-white/10 text-xs font-medium text-zinc-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
              Logout
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#16161f]" />
            </div>
          </button>
        </div>
      </aside>

      {/* ── Mobile drawer backdrop ── */}
      <div
        className={clsx(
          'md:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-md transition-opacity duration-300',
          drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setDrawerOpen(false)}
      />

      {/* ── Mobile drawer ── */}
      <div
        className={clsx(
          'md:hidden fixed inset-y-0 left-0 z-50 w-[280px] glass-strong gradient-border flex flex-col',
          'transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-5 pt-6 pb-4 safe-top border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-border bg-gradient-brand flex items-center justify-center animate-glow-pulse">
              <span className="text-[#0a0a0f] font-bold text-lg font-outfit tracking-tighter">H</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-wider text-zinc-100 uppercase font-outfit">Hermes</h1>
              <p className="text-[10px] text-zinc-500 font-serif italic">Agent Console</p>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-2.5 -mr-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 mt-3 space-y-0.5 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={clsx(
                  'relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium text-[15px] font-outfit',
                  isActive
                    ? 'text-[#c9956a] bg-[#c9956a]/10 border-l-2 border-[#c9956a]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border-l-2 border-transparent'
                )}
              >
                <item.icon
                  size={20}
                  strokeWidth={isActive ? 2 : 1.5}
                  className={isActive ? 'drop-shadow-[0_0_8px_rgba(201,149,106,0.3)]' : ''}
                />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5 safe-bottom">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-white/5 transition-all text-[15px] font-medium font-outfit"
          >
            <LogOut size={20} strokeWidth={1.5} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile top header */}
        <div className="md:hidden flex items-center gap-2.5 px-4 py-2.5 border-b border-white/5 glass flex-shrink-0 backdrop-blur-xl">
          <button onClick={() => setDrawerOpen(true)} className="p-1.5 -ml-1.5 rounded-lg text-zinc-400 active:bg-white/5 transition-colors">
            <Menu size={20} />
          </button>
          <span className="text-[14px] font-semibold text-zinc-100 font-outfit">{currentPage?.label || 'Hermes'}</span>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>

        {/* ── Mobile bottom tab bar ── */}
        <nav className="md:hidden relative flex items-stretch glass backdrop-blur-xl border-t border-white/5 pb-safe flex-shrink-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9956a]/20 to-transparent" />

          {primaryMobileItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 pt-2 pb-1.5 relative group"
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-transparent via-[#c9956a] to-transparent rounded-full" />
                )}

                <item.icon
                  size={22}
                  strokeWidth={isActive ? 2.2 : 1.5}
                  className={clsx(
                    'transition-all duration-200',
                    isActive
                      ? 'text-[#c9956a] drop-shadow-[0_0_8px_rgba(201,149,106,0.5)]'
                      : 'text-zinc-500'
                  )}
                />
                <span className={clsx(
                  'text-[11px] font-medium leading-tight transition-all font-outfit',
                  isActive ? 'text-[#c9956a]' : 'text-zinc-500'
                )}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}

          {/* More menu button */}
          <button
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            className={clsx(
              'flex-1 flex flex-col items-center justify-center gap-0.5 pt-2 pb-1.5 relative group',
              moreMenuOpen && 'text-[#c9956a]'
            )}
          >
            <MoreHorizontal
              size={22}
              strokeWidth={moreMenuOpen ? 2.2 : 1.5}
              className={clsx(
                'transition-all duration-200',
                moreMenuOpen ? 'text-[#c9956a]' : 'text-zinc-500'
              )}
            />
            <span className={clsx(
              'text-[11px] font-medium leading-tight font-outfit',
              moreMenuOpen ? 'text-[#c9956a]' : 'text-zinc-500'
            )}>
              More
            </span>
          </button>

          {/* More menu dropdown */}
          {moreMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMoreMenuOpen(false)}
              />
              <div className="absolute bottom-full left-3 right-3 mb-3 glass-strong gradient-border rounded-2xl p-2.5 z-50 animate-slide-up grid grid-cols-2 gap-1">
                {overflowMobileItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.to);
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMoreMenuOpen(false)}
                      className={clsx(
                        'flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all font-medium text-[13px] font-outfit',
                        isActive
                          ? 'text-[#c9956a] bg-[#c9956a]/10'
                          : 'text-zinc-400 active:text-zinc-200 active:bg-white/5'
                      )}
                    >
                      <item.icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </>
          )}
        </nav>
      </div>
    </div>
  );
};
