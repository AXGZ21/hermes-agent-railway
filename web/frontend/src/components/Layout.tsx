import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, History, Puzzle, Settings, FileText, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useState, useEffect } from 'react';
import clsx from 'clsx';

const navItems = [
  { to: '/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/sessions', icon: History, label: 'Sessions' },
  { to: '/skills', icon: Puzzle, label: 'Skills' },
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
      <aside className="hidden md:flex w-[220px] bg-surface-1 border-r border-white/[0.06] flex-col flex-shrink-0">
        <div className="px-5 pt-6 pb-4">
          <h1 className="text-xl font-bold tracking-tight text-violet-400 font-mono">HERMES</h1>
          <p className="text-[11px] text-slate-500 mt-0.5 tracking-wide">Agent Dashboard</p>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-[13px] font-medium',
                  isActive
                    ? 'bg-violet-500/15 text-violet-400'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                )
              }
            >
              <item.icon size={18} strokeWidth={1.8} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-500 hover:bg-white/[0.04] hover:text-slate-300 transition-all text-[13px]"
          >
            <LogOut size={18} strokeWidth={1.8} />
            <span>Logout</span>
          </button>
          <div className="px-3 pt-3 pb-1 text-[10px] text-slate-600">
            Hermes Agent v1.0
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
          'md:hidden fixed inset-y-0 left-0 z-50 w-[270px] bg-surface-1 border-r border-white/[0.06] flex flex-col',
          'transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 safe-top">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-violet-400 font-mono">HERMES</h1>
            <p className="text-[11px] text-slate-500 mt-0.5">Agent Dashboard</p>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-2.5 -mr-2 rounded-xl text-slate-400 active:bg-white/[0.08]"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 mt-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-[15px] font-medium',
                  isActive
                    ? 'bg-violet-500/15 text-violet-400'
                    : 'text-slate-400 active:bg-white/[0.06]'
                )
              }
            >
              <item.icon size={22} strokeWidth={1.8} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/[0.06] safe-bottom">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-slate-500 active:bg-white/[0.06] text-[15px]"
          >
            <LogOut size={22} strokeWidth={1.8} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 h-12 bg-surface-1/80 backdrop-blur-xl border-b border-white/[0.06] flex-shrink-0 safe-top">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 -ml-2 rounded-xl text-slate-400 active:bg-white/[0.08]"
          >
            <Menu size={22} strokeWidth={1.8} />
          </button>

          <span className="text-[13px] font-semibold text-slate-200 tracking-wide">
            {currentPage?.label || 'Dashboard'}
          </span>

          <div className="w-[38px]" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>

        {/* ── Mobile bottom tab bar ── */}
        <nav className="md:hidden flex items-end bg-surface-1/90 backdrop-blur-xl border-t border-white/[0.06] safe-bottom flex-shrink-0">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex-1 flex flex-col items-center gap-[3px] pt-2 pb-1.5"
              >
                <div className={clsx(
                  'flex items-center justify-center w-10 h-7 rounded-full transition-all',
                  isActive && 'bg-violet-500/15'
                )}>
                  <item.icon
                    size={19}
                    strokeWidth={isActive ? 2.2 : 1.5}
                    className={clsx(
                      'transition-colors',
                      isActive ? 'text-violet-400' : 'text-slate-500'
                    )}
                  />
                </div>
                <span className={clsx(
                  'text-[10px] font-medium leading-none transition-colors',
                  isActive ? 'text-violet-400' : 'text-slate-500'
                )}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
