import { useNavigate } from 'react-router-dom';
import { Grid3x3, ClipboardCheck, Mic, ArrowRight } from 'lucide-react';

const CARDS = [
  { to: '/track-record/skills', label: 'Skill Builder History', icon: Grid3x3, blurb: "Every MCQ, Coding, Aptitude, HR, and Company practice session you've completed." },
  { to: '/track-record/assessment', label: 'Mock Assessment History', icon: ClipboardCheck, blurb: 'Every company assessment attempt, with section and question-level detail.' },
  { to: '/track-record/interview', label: 'AI Mock Interview History', icon: Mic, blurb: 'Every finished interview session, question by question.' }
];

export default function TrackRecord() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-fg text-lg font-semibold">Track Record</h2>
        <p className="text-muted text-sm mt-1">Review exactly what you did in every past session, across all three prep tools.</p>
      </div>
      <div className="flex flex-col gap-3">
        {CARDS.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.to}
              onClick={() => navigate(c.to)}
              className="card p-5 flex items-center gap-4 text-left hover:border-accent-500/50 transition-colors cursor-pointer"
            >
              <div className="w-11 h-11 rounded-full bg-surface2 flex items-center justify-center shrink-0">
                <Icon size={22} className="text-accent-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-fg font-medium">{c.label}</p>
                <p className="text-muted text-xs mt-0.5">{c.blurb}</p>
              </div>
              <ArrowRight size={16} className="text-muted shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}