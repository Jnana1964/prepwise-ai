import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Bell, ChevronDown, User, LogOut } from 'lucide-react';
import { useUser } from '../context/UserContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

function initialsFrom(name) {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export default function Topbar({ title, subtitle }) {
  const { user } = useUser();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  return (
    <header className="flex items-center justify-between px-8 py-6 border-b border-border bg-base">
      <div>
        <h1 className="text-2xl font-bold text-fg">{title}</h1>
        {subtitle && <p className="text-muted text-sm mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted hover:text-fg hover:border-accent-500 transition-colors"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button className="relative w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted hover:text-fg hover:border-accent-500 transition-colors">
          <Bell size={16} />
          {user?.unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-500 text-[10px] flex items-center justify-center text-white font-semibold">
              {user.unreadNotifications}
            </span>
          )}
        </button>

        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-2 pl-2 cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-accent-500 flex items-center justify-center text-white text-sm font-bold">
              {initialsFrom(user?.name)}
            </div>
            <div className="leading-tight text-left">
              <p className="text-sm text-fg">
                Welcome back, {user?.name?.split(' ')[0] || '...'}! 👋
              </p>
            </div>
            <ChevronDown size={16} className={`text-muted transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 card p-1.5 z-20">
              <div className="px-3 py-2 border-b border-border mb-1">
                <p className="text-fg text-sm font-medium truncate">{user?.name || 'Account'}</p>
                <p className="text-muted text-xs truncate">{user?.email || ''}</p>
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/dashboard');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-btn text-sm text-muted hover:bg-surface2 hover:text-fg transition-colors"
              >
                <User size={14} /> Profile
              </button>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-btn text-sm text-danger hover:bg-danger/10 transition-colors"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
