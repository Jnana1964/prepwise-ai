import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  FileText,
  Target,
  Briefcase,
  Grid3x3,
  ClipboardCheck,
  Mic,
  Share2,
  History,
  Crown,
  LogOut
} from 'lucide-react';
import Logo from './Logo.jsx';

// Order matters: Mock Assessment sits between Skill Builder and AI Mock
// Interview because that's the actual gate sequence - Skill Builder must
// be complete to unlock the assessment, and the assessment score must meet
// MOCK_ASSESSMENT_PASS_THRESHOLD to unlock the interview.
const NAV_ITEMS = [
  { to: '/dashboard', label: 'Career Command Center', icon: LayoutGrid },
  { to: '/resume/upload', label: 'Resume Intelligence', icon: FileText, match: '/resume' },
  { to: '/opportunities', label: 'Opportunity Matcher', icon: Target },
  { to: '/applications', label: 'Applications', icon: Briefcase },
  { to: '/skills', label: 'Skill Builder', icon: Grid3x3 },
  { to: '/assessment', label: 'Mock Assessment', icon: ClipboardCheck },
  { to: '/interview', label: 'AI Mock Interview', icon: Mic },
  { to: '/analytics', label: 'Performance Analytics', icon: Share2 },
  { to: '/track-record', label: 'Track Record', icon: History, match: '/track-record' }
];

export default function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-[280px] shrink-0 h-screen sticky top-0 bg-base border-r border-border flex flex-col px-4 py-6">
      <div className="flex items-center gap-3 px-2 mb-8">
        <Logo size={38} />
        <div>
          <p className="text-fg font-bold text-lg leading-tight">PrepWise AI</p>
          <p className="text-muted text-[11px] leading-tight">AI-Powered Career Preparation Platform</p>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => {
                const active = isActive || (item.match && location.pathname.startsWith(item.match));
                return active ? 'nav-link-active' : 'nav-link';
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="flex flex-col gap-2 pt-4 border-t border-border">
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-accent-500/50 text-accent-500 text-sm font-medium hover:bg-accent-500/10 transition-colors">
          <Crown size={16} />
          Upgrade to Pro
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-muted text-sm font-medium hover:bg-surface2 hover:text-fg transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
