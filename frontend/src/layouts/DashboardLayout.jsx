import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Topbar from '../components/Topbar.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const PAGE_META = [
  { match: /^\/dashboard/, title: 'Career Command Center', subtitle: 'Your all-in-one placement preparation dashboard' },
  { match: /^\/resume\/upload/, title: 'Resume Intelligence — Upload', subtitle: 'Upload your resume and get AI-powered analysis' },
  { match: /^\/resume\/.*\/analysis/, title: 'Resume Intelligence — Analysis', subtitle: "Here's how your resume performed" },
  { match: /^\/resume\/.*\/improve/, title: 'Resume Intelligence — Improve', subtitle: 'Get suggestions to make your resume better' },
  { match: /^\/resume\/.*\/edit/, title: 'Resume Intelligence — Edit', subtitle: 'Edit your resume directly, no re-upload needed' },
  { match: /^\/opportunities/, title: 'Opportunity Matcher', subtitle: 'Discover opportunities that match your skills' },
  { match: /^\/applications/, title: 'Applications', subtitle: 'Track all your job applications in one place' },
  { match: /^\/skills/, title: 'Skill Builder', subtitle: 'Practice and improve your skills' },
  { match: /^\/assessment/, title: 'Mock Assessment', subtitle: 'Score to unlock the AI Mock Interview' },
  { match: /^\/interview/, title: 'AI Mock Interview', subtitle: 'Practice with AI-powered mock interviews' },
  { match: /^\/analytics/, title: 'Performance Analytics', subtitle: 'Track your progress and improve' }
];

export default function DashboardLayout() {
  const location = useLocation();
  const { theme } = useTheme();
  const meta = PAGE_META.find((m) => m.match.test(location.pathname)) || {};

  return (
    <div data-theme={theme} className="flex min-h-screen bg-base">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
