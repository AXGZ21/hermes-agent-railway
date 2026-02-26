import { NavLink } from 'react-router-dom';
import { MessageSquare, History, Puzzle, Settings, FileText } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { to: '/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/sessions', icon: History, label: 'Sessions' },
  { to: '/skills', icon: Puzzle, label: 'Skills' },
  { to: '/config', icon: Settings, label: 'Configuration' },
  { to: '/logs', icon: FileText, label: 'Logs' },
];

export const Sidebar = () => {
  return (
    <aside className="w-60 bg-slate-900 border-r border-slate-700 flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold font-mono text-violet-400">HERMES</h1>
        <p className="text-xs text-slate-400 mt-1">Agent Dashboard</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-violet-500 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700 text-xs text-slate-500">
        <p>Hermes Agent v1.0</p>
        <p className="mt-1">by Nous Research</p>
      </div>
    </aside>
  );
};
