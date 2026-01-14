import { Outlet, NavLink } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Sparkles,
  FileText,
  ScrollText,
  Dice6
} from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/chapters', icon: BookOpen, label: 'Chapters' },
  { to: '/synthesize', icon: Sparkles, label: 'Synthesize' },
  { to: '/templates', icon: FileText, label: 'Templates' },
  { to: '/sessions', icon: ScrollText, label: 'Sessions' },
];

function Layout() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sidebar w-64 p-4 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-6 mb-6">
          <div className="w-10 h-10 bg-dm-gold rounded-lg flex items-center justify-center loading-glow">
            <Dice6 className="w-6 h-6 text-dm-dark" />
          </div>
          <div>
            <h1 className="font-medieval text-dm-gold text-lg">GameMaster</h1>
            <p className="text-xs text-gray-400">Assistant</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
              end={item.to === '/'}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-dm-gold/20">
          <p className="text-xs text-gray-500 text-center">
            Curse of Strahd: Reloaded
          </p>
          <p className="text-xs text-gray-600 text-center mt-1">
            by DragnaCarta
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
